import type { Part } from "@google/genai";
import axios from "axios";

import { type Ingredient, type IngredientGroup, UNIT_CODES, type UnitCode } from "@recipe/common";

import cloudinary from "../api/cloudinary";
import { generateJson, isBadRequest, STRONG_MODEL, toVideoPart } from "../api/gemeni";
import prisma from "../lib/prisma";
import {
    amountsPrompt,
    amountsSchema,
    nutritionPrompt,
    nutritionSchema,
    type PromptContext,
    recipeImagePrompt,
    recipePrompt,
    recipeSchema,
    recipeVideoPrompt,
} from "../prompts/recipe";
import { MediaItem, ParsedRecipeAI } from "../types/pinterest";
import { formatIngredient } from "../utils/formatIngredient";
import { extractMedia, extractText, fetchPage } from "../utils/scraper";
import { extractPin, fetchCaptions, isPinterestUrl, pinToText, toPlayableVideo } from "./pinterest";
import { ensureCategories, ensureTags, getFallbackCategory } from "./userDefaults";
import { fetchYoutubeVideo, getYoutubeId, youtubeToText } from "./youtube";

// Видео длиннее ~3 минут (720p) в Gemini не отправляем
const MAX_VIDEO_BYTES = 60 * 1024 * 1024;
// Ролики YouTube длиннее часа ИИ не смотрит: рецепт берём только из описания
const MAX_YOUTUBE_SECONDS = 60 * 60;
// Короче этого в тексте рецепта быть не может
const MIN_TEXT_LENGTH = 50;
// Больше такой доли ингредиентов без количества или с количеством «на глаз» — результат слабый
const WEAK_SHARE = 1 / 3;

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

export async function parseRecipeFromUrl(url: string, userId: string, language: string) {
    const youtubeId = getYoutubeId(url);
    if (youtubeId) return parseYoutube(youtubeId, userId, language);

    const html = await fetchPage(url);

    if (isPinterestUrl(url)) return parsePin(html, userId, language);

    const text = extractText(html);

    if (!text || text.length < MIN_TEXT_LENGTH) {
        throw new Error("Не удалось извлечь текст со страницы");
    }

    const lists = await getUserLists(userId);
    const recipe = await recognizeText(text, toPromptContext(lists, language), lists);
    const media = extractMedia(html, url);
    const cover = await storeImage(media.find((item) => item.type === "image")?.url ?? null);
    const video = media.find((item) => item.type === "video")?.url ?? null;

    return { ...(await complete(recipe)), media: toMediaList(cover, video) };
}

// YouTube: сначала описание под роликом и комментарии автора, там часто лежит весь рецепт. Если рецепт из него неполный
// или количества «на глаз» — ИИ смотрит сам ролик вместе с описанием. Видео в рецепт не кладём: ссылка остаётся в источнике
async function parseYoutube(id: string, userId: string, language: string) {
    const video = await fetchYoutubeVideo(id);
    const text = youtubeToText(video);
    const lists = await getUserLists(userId);
    const context = toPromptContext(lists, language);

    const fromText =
        video.description.length + video.comments.length >= MIN_TEXT_LENGTH
            ? await recognizeText(text, context, lists).catch((error) => {
                  if (isNotFound(error)) return null;
                  throw error;
              })
            : null;

    const fromVideo =
        isWeak(fromText) && video.duration <= MAX_YOUTUBE_SECONDS
            ? await generateFromVideoPart({ fileData: { fileUri: video.url } }, text, context)
                  .then((raw) => normalizeRecipe(raw, lists))
                  .catch((error) => {
                      // Рецепт из описания уже есть — ошибка видео импорт не ломает
                      if (!fromText) throw error;
                      console.warn("Не удалось распознать видео YouTube:", error instanceof Error ? error.message : error);
                      return null;
                  })
            : null;

    const found = pickBetter(fromText, fromVideo);
    if (!found) throw new Error("Рецепт не найден");

    const recipe = await complete(found);
    const cover = await storeImage(video.cover);

    return { ...recipe, title: recipe.title || video.title, media: toMediaList(cover, null) };
}

// Пин: название, описание и субтитры видео → ИИ. Если рецепт из текста неполный или количества в нём «на глаз» —
// ИИ смотрит само видео вместе с этим текстом.
// Видео и превью берём всегда: пин с видео без рецепта сохраняется как рецепт-видео с пустыми ингредиентами и шагами
async function parsePin(html: string, userId: string, language: string) {
    const pin = extractPin(html);
    const [captions, video] = await Promise.all([
        pin.captionsUrl ? fetchCaptions(pin.captionsUrl) : "",
        pin.video ? toPlayableVideo(pin.video) : null,
    ]);
    const text = pinToText(pin, captions);
    const lists = await getUserLists(userId);
    const context = toPromptContext(lists, language);

    const fromText = await recognizePin(text, video ? null : pin.cover, context, lists).catch((error) => {
        if (video && isNotFound(error)) return null;
        throw error;
    });

    const fromVideo = video && isWeak(fromText) ? await recognizeVideo(video, text, context, lists) : null;
    const found = pickBetter(fromText, fromVideo);
    const recipe = found ? await complete(found) : emptyRecipe(lists);

    // Обложку заливаем только после распознавания, чтобы при ошибке не оставлять файлы в Cloudinary
    const cover = await storeImage(pin.cover);

    return { ...recipe, title: recipe.title || pin.title, media: toMediaList(cover, video) };
}

const allItems = (recipe: ParsedRecipeAI) => recipe.ingredients.flatMap((group) => group.items);

// Ингредиент без точного количества: пусто или оценка ИИ. «По вкусу» количеством не считается
const isVague = (item: Ingredient) => item.unit !== "to_taste" && (item.amount === null || !!item.approx);

const vagueShare = (recipe: ParsedRecipeAI) => {
    const items = allItems(recipe).filter((item) => item.unit !== "to_taste");
    return items.length ? items.filter(isVague).length / items.length : 0;
};

// Слабый результат: нет ингредиентов или шагов, либо у многих ингредиентов нет точного количества
const isWeak = (recipe: ParsedRecipeAI | null) =>
    !recipe || recipe.ingredients.length === 0 || recipe.steps.length === 0 || vagueShare(recipe) > WEAK_SHARE;

// Чем полнее рецепт и чем больше точных количеств, тем выше оценка
const score = (recipe: ParsedRecipeAI | null) =>
    recipe ? (recipe.ingredients.length ? 2 : 0) + (recipe.steps.length ? 2 : 0) + (1 - vagueShare(recipe)) : -1;

// При равной оценке остаётся первый
const pickBetter = (first: ParsedRecipeAI | null, second: ParsedRecipeAI | null) => (score(second) > score(first) ? second : first);

// «200 г», «2 ст. л.», «1 cup», «½ tsp»: количество с единицей в исходном тексте
const QUANTITY_PATTERN = /[\d½¼¾⅓⅔]\s*(?:г|гр|кг|мл|л|ст|ч|шт|стак|зуб|g|kg|ml|l|oz|lb|cups?|tbsp|tsp|pcs|cloves?)(?![\p{L}])/giu;

const countQuantities = (text: string) => text.match(QUANTITY_PATTERN)?.length ?? 0;

// Текст → рецепт. Быстрая модель пропустила количества, которые в тексте есть, — вторая попытка на сильной
async function recognizeText(text: string, context: PromptContext, lists: UserLists) {
    const parts = [{ text: recipePrompt(text, context) }];
    const fast = normalizeRecipe(await generateRecipe(parts, context), lists);

    const missed = allItems(fast).filter(isVague).length;
    if (!isWeak(fast) || countQuantities(text) < missed) return fast;

    try {
        return pickBetter(fast, normalizeRecipe(await generateRecipe(parts, context, STRONG_MODEL), lists)) ?? fast;
    } catch (error) {
        console.warn("Вторая попытка распознавания не удалась:", error instanceof Error ? error.message : error);
        return fast;
    }
}

// Видео → рецепт. Любая ошибка импорт не ломает: остаётся то, что нашлось в тексте
async function recognizeVideo(url: string, text: string, context: PromptContext, lists: UserLists) {
    // HLS (.m3u8) Gemini не читает
    if (!url.endsWith(".mp4")) return null;

    try {
        // Размер узнать не вышло (хостинг видео отвечает медленно) — пробуем скачать, лишнее отсечёт maxContentLength
        const size = await axios
            .head(url, { timeout: 15000 })
            .then(({ headers }) => Number(headers["content-length"]) || 0)
            .catch(() => 0);
        if (size > MAX_VIDEO_BYTES) return null;

        return normalizeRecipe(await generateFromVideo(url, text, context), lists);
    } catch (error) {
        console.warn("Не удалось распознать видео:", error instanceof Error ? error.message : error);
        return null;
    }
}

// Видео скачиваем сами и отдаём Gemini файлом: по чужой ссылке он его не открывает
async function generateFromVideo(url: string, text: string, context: PromptContext) {
    const { data } = await axios.get<ArrayBuffer>(url, { responseType: "arraybuffer", timeout: 60000, maxContentLength: MAX_VIDEO_BYTES });
    const { part, remove } = await toVideoPart(Buffer.from(data), "video/mp4");

    try {
        return await generateFromVideoPart(part, text, context);
    } finally {
        await remove();
    }
}

// Видео смотрит сильная модель: быстрая пропускает шаги и количества. text — подпись, описание или субтитры
async function generateFromVideoPart(video: Part, text: string, context: PromptContext) {
    const parts = [video, { text: recipeVideoPrompt(context, text) }];

    try {
        return await generateRecipe(parts, context, STRONG_MODEL, true);
    } catch (error) {
        if (!isBadRequest(error)) throw error;

        // Не каждая модель принимает низкое разрешение видео
        console.warn("Gemini не принял видео в низком разрешении, отправляем в обычном");
        return generateRecipe(parts, context, STRONG_MODEL);
    }
}

// Сначала текст пина. Если рецепта в нём нет — картинка пина: часто рецепт написан прямо на ней
async function recognizePin(text: string, image: string | null, context: PromptContext, lists: UserLists) {
    if (text.length >= MIN_TEXT_LENGTH) {
        try {
            return await recognizeText(text, context, lists);
        } catch (error) {
            if (!image || !isNotFound(error)) throw error;
        }
    }

    if (!image) throw new Error("Рецепт не найден");

    const { base64, mimeType } = await downloadFile(image);
    return normalizeRecipe(await generateFromImage(base64, mimeType, context), lists);
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

export async function parseRecipeFromImage(base64: string, mimeType: string, userId: string, language: string) {
    const lists = await getUserLists(userId);
    const raw = await generateFromImage(base64, mimeType, toPromptContext(lists, language));
    return { ...(await complete(normalizeRecipe(raw, lists))), media: [] };
}

export async function parseRecipeFromText(text: string, userId: string, language: string) {
    const lists = await getUserLists(userId);
    const recipe = await recognizeText(text, toPromptContext(lists, language), lists);
    return { ...(await complete(recipe)), media: [] };
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

const toPromptContext = (lists: UserLists, language: string): PromptContext => ({
    categories: lists.categories.map((category) => category.name),
    tags: lists.tags.map((tag) => tag.name),
    language,
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
                    const { name, amount, unit, approx } = (item ?? {}) as Record<string, unknown>;
                    const value = toNumber(amount);

                    return {
                        name: toText(name),
                        amount: value,
                        unit: isUnitCode(unit) ? unit : null,
                        // Пометка «~» только там, где количество есть и его оценил ИИ
                        ...(approx === true && value !== null && { approx: true }),
                    };
                })
                .filter((item: Ingredient) => item.name),
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

// Доводим рецепт: сначала недостающие количества, потом КБЖУ (ему количества нужны)
const complete = async (recipe: ParsedRecipeAI) => withNutrition(await withAmounts(recipe));

// ИИ оставил ингредиенты без количества — оцениваем их отдельным запросом и помечаем «~». Не вышло — оставляем пустыми
async function withAmounts(recipe: ParsedRecipeAI): Promise<ParsedRecipeAI> {
    const items = allItems(recipe);
    const missing = items.flatMap((item, index) => (item.amount === null && item.unit !== "to_taste" ? [index + 1] : []));
    if (missing.length === 0) return recipe;

    try {
        const raw = await generateJson<{ items?: { index?: unknown; amount?: unknown; unit?: unknown }[] }>({
            parts: [{ text: amountsPrompt(recipe.title, recipe.servings, items.map(formatIngredient), missing) }],
            schema: amountsSchema,
        });
        const estimates = new Map((raw.items ?? []).map((item) => [Number(item.index), item]));
        let number = 0;

        return {
            ...recipe,
            ingredients: recipe.ingredients.map((group) => ({
                ...group,
                items: group.items.map((item) => {
                    number += 1;
                    const estimate = missing.includes(number) ? estimates.get(number) : undefined;
                    const amount = toNumber(estimate?.amount);
                    if (amount === null) return item;

                    return { ...item, amount, unit: isUnitCode(estimate?.unit) && estimate.unit !== "to_taste" ? estimate.unit : item.unit, approx: true };
                }),
            })),
        };
    } catch (error) {
        console.warn("Не удалось оценить количества:", error instanceof Error ? error.message : error);
        return recipe;
    }
}

// КБЖУ не пришло вместе с рецептом — досчитываем отдельным запросом. Не вышло — оставляем пустым
async function withNutrition(recipe: ParsedRecipeAI): Promise<ParsedRecipeAI> {
    if (recipe.calories !== null || recipe.ingredients.length === 0) return recipe;

    const ingredients = allItems(recipe).map(formatIngredient);

    try {
        const raw = await generateJson<RawRecipeAI>({
            parts: [{ text: nutritionPrompt(recipe.title, recipe.servings, ingredients) }],
            schema: nutritionSchema,
        });
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

const generateRecipe = (parts: Part[], context: PromptContext, model?: string, lowResolution?: boolean) =>
    generateJson<RawRecipeAI>({ parts, schema: recipeSchema(context), model, lowResolution });

const generateFromImage = (base64: string, mimeType: string, context: PromptContext) =>
    generateRecipe([{ inlineData: { mimeType, data: base64 } }, { text: recipeImagePrompt(context) }], context);
