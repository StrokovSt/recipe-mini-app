import type { GenerativeModel, Part } from "@google/generative-ai";
import axios from "axios";

import { type IngredientGroup, UNIT_CODES, type UnitCode } from "@recipe/common";

import cloudinary from "../api/cloudinary";
import { model, videoModel } from "../api/gemeni";
import prisma from "../lib/prisma";
import { nutritionPrompt, type PromptContext, recipeImagePrompt, recipePrompt, recipeVideoPrompt } from "../prompts/recipe";
import { MediaItem, ParsedRecipeAI } from "../types/pinterest";
import { formatIngredient } from "../utils/formatIngredient";
import { extractMedia, extractText, fetchPage } from "../utils/scraper";
import { extractPin, fetchCaptions, isPinterestUrl, pinToText, toPlayableVideo } from "./pinterest";
import { ensureCategories, ensureTags, getFallbackCategory } from "./userDefaults";

const MAX_RETRIES = 3;
const RETRY_DELAY = 2000;
// Видео длиннее ~3 минут (720p) в Gemini не отправляем
const MAX_VIDEO_BYTES = 60 * 1024 * 1024;
// Больше этого видео не влезет внутрь запроса к Gemini
const MAX_INLINE_VIDEO_BYTES = 20 * 1024 * 1024;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Ответ Gemini как есть: категория и теги — названия, поля могут быть не того типа
interface RawRecipeAI {
    title?: unknown;
    description?: unknown;
    category?: unknown;
    ingredients?: unknown;
    steps?: unknown;
    prepTime?: unknown;
    cookTime?: unknown;
    servings?: unknown;
    calories?: unknown;
    protein?: unknown;
    fat?: unknown;
    carbs?: unknown;
    tags?: unknown;
}

interface UserLists {
    categories: { id: string; name: string }[];
    tags: { id: string; name: string }[];
    fallbackCategoryId: string;
}

export async function parseRecipeFromUrl(url: string, userId: string) {
    const html = await fetchPage(url);

    if (isPinterestUrl(url)) return parsePin(html, userId);

    const text = extractText(html);

    if (!text || text.length < 50) {
        throw new Error("Не удалось извлечь текст со страницы");
    }

    const lists = await getUserLists(userId);
    const raw = await generateWithRetry(text, toPromptContext(lists));
    const media = extractMedia(html, url);
    const cover = await storeImage(media.find((item) => item.type === "image")?.url ?? null);
    const video = media.find((item) => item.type === "video")?.url ?? null;

    return { ...(await withNutrition(normalizeRecipe(raw, lists))), media: toMediaList(cover, video) };
}

// Пин: название, описание и субтитры видео → ИИ. Если в тексте нет ингредиентов или шагов — ИИ смотрит само видео.
// Видео и превью берём всегда: пин с видео без рецепта сохраняется как рецепт-видео с пустыми ингредиентами и шагами
async function parsePin(html: string, userId: string) {
    const pin = extractPin(html);
    const [captions, video] = await Promise.all([
        pin.captionsUrl ? fetchCaptions(pin.captionsUrl) : "",
        pin.video ? toPlayableVideo(pin.video) : null,
    ]);
    const text = pinToText(pin, captions);
    const lists = await getUserLists(userId);
    const context = toPromptContext(lists);

    const fromText = await recognizePin(text, video ? null : pin.cover, context, lists).catch((error) => {
        if (video && isNotFound(error)) return null;
        throw error;
    });

    const fromVideo = video && !isComplete(fromText) ? await recognizeVideo(video, context, lists) : null;
    const found = fromVideo ?? fromText;
    const recipe = found ? await withNutrition(found) : emptyRecipe(lists);

    // Обложку заливаем только после распознавания, чтобы при ошибке не оставлять файлы в Cloudinary
    const cover = await storeImage(pin.cover);

    return { ...recipe, title: recipe.title || pin.title, media: toMediaList(cover, video) };
}

const isComplete = (recipe: ParsedRecipeAI | null) => !!recipe && recipe.ingredients.length > 0 && recipe.steps.length > 0;

// Видео → рецепт. Любая ошибка импорт не ломает: остаётся то, что нашлось в тексте
async function recognizeVideo(url: string, context: PromptContext, lists: UserLists) {
    // HLS (.m3u8) Gemini не читает
    if (!url.endsWith(".mp4")) return null;

    try {
        const { headers } = await axios.head(url, { timeout: 5000 });
        const size = Number(headers["content-length"]) || 0;
        if (size > MAX_VIDEO_BYTES) return null;

        return normalizeRecipe(await generateFromVideo(url, size, context), lists);
    } catch (error) {
        console.warn("Не удалось распознать видео:", error instanceof Error ? error.message : error);
        return null;
    }
}

// Сначала даём Gemini ссылку: файл он скачает сам. Не взял по ссылке — скачиваем и отправляем внутри запроса
async function generateFromVideo(url: string, size: number, context: PromptContext) {
    const prompt = { text: recipeVideoPrompt(context) };

    try {
        return await generatePartsWithRetry(videoModel, [{ fileData: { fileUri: url, mimeType: "video/mp4" } }, prompt]);
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        if (!size || size > MAX_INLINE_VIDEO_BYTES || message.startsWith("QUOTA_EXCEEDED")) throw error;

        console.warn("Gemini не взял видео по ссылке, отправляем файлом:", message);
        const { base64, mimeType } = await downloadFile(url);
        return generatePartsWithRetry(videoModel, [{ inlineData: { mimeType, data: base64 } }, prompt]);
    }
}

// Сначала текст пина. Если рецепта в нём нет — картинка пина: часто рецепт написан прямо на ней
async function recognizePin(text: string, image: string | null, context: PromptContext, lists: UserLists) {
    if (text.length >= 50) {
        try {
            return normalizeRecipe(await generateWithRetry(text, context), lists);
        } catch (error) {
            if (!image || !isNotFound(error)) throw error;
        }
    }

    if (!image) throw new Error("Рецепт не найден");

    const { base64, mimeType } = await downloadFile(image);
    return normalizeRecipe(await generateFromImageWithRetry(base64, mimeType, context), lists);
}

const isNotFound = (error: unknown) => error instanceof Error && error.message.includes("Рецепт не найден");

const emptyRecipe = (lists: UserLists): ParsedRecipeAI => ({
    title: "",
    description: null,
    categoryId: lists.fallbackCategoryId,
    ingredients: [],
    steps: [],
    prepTime: null,
    cookTime: null,
    servings: null,
    calories: null,
    protein: null,
    fat: null,
    carbs: null,
    tags: [],
});

async function downloadFile(url: string) {
    const { data, headers } = await axios.get<ArrayBuffer>(url, { responseType: "arraybuffer", timeout: 30000 });
    const mimeType = String(headers["content-type"] ?? "image/jpeg").split(";")[0];
    return { base64: Buffer.from(data).toString("base64"), mimeType };
}

// Обложку с чужого сайта перезаливаем в Cloudinary: чужую ссылку могут удалить или заблокировать.
// Не получилось — оставляем исходную ссылку
async function storeImage(url: string | null) {
    if (!url) return null;

    try {
        const result = await cloudinary.uploader.upload(url, { folder: "recipes" });
        return result.secure_url;
    } catch (error) {
        console.warn("Не удалось перезалить обложку:", error instanceof Error ? error.message : error);
        return url;
    }
}

// В форме одна обложка и одно видео
const toMediaList = (cover: string | null, video: string | null): MediaItem[] => [
    ...(cover ? [{ url: cover, type: "image" as const }] : []),
    ...(video ? [{ url: video, type: "video" as const }] : []),
];

export async function parseRecipeFromImage(base64: string, mimeType: string, userId: string) {
    const lists = await getUserLists(userId);
    const raw = await generateFromImageWithRetry(base64, mimeType, toPromptContext(lists));
    return { ...(await withNutrition(normalizeRecipe(raw, lists))), media: [] };
}

export async function parseRecipeFromText(text: string, userId: string) {
    const lists = await getUserLists(userId);
    const raw = await generateWithRetry(text, toPromptContext(lists));
    return { ...(await withNutrition(normalizeRecipe(raw, lists))), media: [] };
}

async function getUserLists(userId: string): Promise<UserLists> {
    await Promise.all([ensureCategories(userId), ensureTags(userId)]);

    const [categories, tags, fallback] = await Promise.all([
        prisma.category.findMany({ where: { userId }, select: { id: true, name: true } }),
        prisma.tag.findMany({ where: { userId }, select: { id: true, name: true } }),
        getFallbackCategory(userId),
    ]);

    return { categories, tags, fallbackCategoryId: fallback.id };
}

const toPromptContext = (lists: UserLists): PromptContext => ({
    categories: lists.categories.map((category) => category.name),
    tags: lists.tags.map((tag) => tag.name),
});

// Сравнение названий без учёта регистра и лишних пробелов
const sameName = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();

const toText = (value: unknown) => (typeof value === "string" ? value.trim() : "");

const toNumber = (value: unknown) => {
    const number = typeof value === "string" ? Number(value.replace(",", ".")) : value;
    return typeof number === "number" && Number.isFinite(number) && number > 0 ? number : null;
};

const toInteger = (value: unknown) => {
    const number = toNumber(value);
    return number === null ? null : Math.round(number);
};

// КБЖУ: целое неотрицательное, всё остальное — «неизвестно»
const toNutrition = (value: unknown) => {
    const number = toInteger(value);
    return number === null || number < 0 ? null : number;
};

const isUnitCode = (value: unknown): value is UnitCode =>
    typeof value === "string" && (UNIT_CODES as string[]).includes(value);

// Приводит ответ AI к формату рецепта: категория и теги — id из списков пользователя,
// неизвестная категория → «Разное», неизвестные теги и единицы отбрасываются
function normalizeRecipe(raw: RawRecipeAI, lists: UserLists): ParsedRecipeAI {
    const categoryName = toText(raw.category);
    const category = lists.categories.find((item) => sameName(item.name, categoryName));

    const tagNames = Array.isArray(raw.tags) ? raw.tags.map(toText) : [];
    const tags = lists.tags.filter((tag) => tagNames.some((name) => sameName(tag.name, name)));

    const groups = Array.isArray(raw.ingredients) ? raw.ingredients : [];
    const ingredients: IngredientGroup[] = groups
        .map((group) => ({
            title: toText(group?.title) || null,
            items: (Array.isArray(group?.items) ? group.items : [])
                .map((item: unknown) => {
                    // Старый формат ответа: ингредиент строкой
                    if (typeof item === "string") return { name: item.trim(), amount: null, unit: null };

                    const { name, amount, unit } = (item ?? {}) as Record<string, unknown>;
                    return {
                        name: toText(name),
                        amount: toNumber(amount),
                        unit: isUnitCode(unit) ? unit : null,
                    };
                })
                .filter((item: { name: string }) => item.name),
        }))
        .filter((group) => group.items.length > 0);

    const steps = (Array.isArray(raw.steps) ? raw.steps : [])
        .map((step) => toText(typeof step === "object" && step ? (step as { text?: unknown }).text : step))
        .filter(Boolean)
        .map((text) => ({ text, images: [] }));

    // На картинке или странице нет рецепта: ИИ вернул пустоту, черновик открывать нечем
    if (ingredients.length === 0 && steps.length === 0) {
        throw new Error("Рецепт не найден");
    }

    return {
        title: toText(raw.title),
        description: toText(raw.description) || null,
        categoryId: category?.id ?? lists.fallbackCategoryId,
        ingredients,
        steps,
        prepTime: toInteger(raw.prepTime),
        cookTime: toInteger(raw.cookTime),
        servings: toInteger(raw.servings),
        calories: toNutrition(raw.calories),
        protein: toNutrition(raw.protein),
        fat: toNutrition(raw.fat),
        carbs: toNutrition(raw.carbs),
        tags: tags.map((tag) => tag.id),
    };
}

// КБЖУ не пришло вместе с рецептом — досчитываем отдельным запросом. Не вышло — оставляем пустым
async function withNutrition(recipe: ParsedRecipeAI): Promise<ParsedRecipeAI> {
    if (recipe.calories !== null || recipe.ingredients.length === 0) return recipe;

    const ingredients = recipe.ingredients.flatMap((group) => group.items.map(formatIngredient));

    try {
        const result = await model.generateContent(nutritionPrompt(recipe.title, recipe.servings, ingredients));
        const raw = parseJson(result.response.text());
        return {
            ...recipe,
            calories: toNutrition(raw.calories),
            protein: toNutrition(raw.protein),
            fat: toNutrition(raw.fat),
            carbs: toNutrition(raw.carbs),
        };
    } catch (error) {
        console.warn("Не удалось оценить КБЖУ:", error instanceof Error ? error.message : error);
        return recipe;
    }
}

async function generateWithRetry(text: string, context: PromptContext, attempt = 1): Promise<RawRecipeAI> {
    try {
        const result = await model.generateContent(recipePrompt(text, context));
        return parseJson(result.response.text());
    } catch (error) {
        return handleRetry(error, attempt, () => generateWithRetry(text, context, attempt + 1));
    }
}

const generateFromImageWithRetry = (base64: string, mimeType: string, context: PromptContext) =>
    generatePartsWithRetry(model, [{ inlineData: { mimeType, data: base64 } }, { text: recipeImagePrompt(context) }]);

async function generatePartsWithRetry(target: GenerativeModel, parts: Part[], attempt = 1): Promise<RawRecipeAI> {
    try {
        const result = await target.generateContent(parts);
        return parseJson(result.response.text());
    } catch (error) {
        return handleRetry(error, attempt, () => generatePartsWithRetry(target, parts, attempt + 1));
    }
}

function parseJson(raw: string) {
    const cleaned = raw.replace(/^```json\n?/, "").replace(/\n?```$/, "").trim();
    return JSON.parse(cleaned) as RawRecipeAI;
}

function handleRetry<T>(error: unknown, attempt: number, retry: () => Promise<T>): Promise<T> {
    const message = error instanceof Error ? error.message : "";
    const is503 = message.includes("503");
    const is429 = message.includes("429");

    if (is503 && attempt < MAX_RETRIES) {
        console.warn(`Gemini 503, повтор ${attempt}/${MAX_RETRIES} через ${RETRY_DELAY * attempt}ms...`);
        return sleep(RETRY_DELAY * attempt).then(retry);
    }

    if (is429) {
        const retryMatch = message.match(/retryDelay.*?(\d+)s/);
        const retryAfter = retryMatch ? parseInt(retryMatch[1]) * 1000 : 60000;
        throw new Error(`QUOTA_EXCEEDED:${retryAfter}`);
    }

    throw error;
}
