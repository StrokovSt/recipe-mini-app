import { type IngredientGroup, UNIT_CODES, type UnitCode } from "@recipe/common";

import { model } from "../api/gemeni";
import prisma from "../lib/prisma";
import { type PromptContext, recipeImagePrompt, recipePrompt } from "../prompts/recipe";
import { ParsedRecipeAI } from "../types/pinterest";
import { extractMedia, extractText, fetchPage } from "../utils/scraper";
import { ensureCategories, ensureTags, getFallbackCategory } from "./userDefaults";

const MAX_RETRIES = 3;
const RETRY_DELAY = 2000;

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
    tags?: unknown;
}

interface UserLists {
    categories: { id: string; name: string }[];
    tags: { id: string; name: string }[];
    fallbackCategoryId: string;
}

export async function parseRecipeFromUrl(url: string, userId: string) {
    const html = await fetchPage(url);
    const text = extractText(html);

    if (!text || text.length < 50) {
        throw new Error("Не удалось извлечь текст со страницы");
    }

    const lists = await getUserLists(userId);
    const raw = await generateWithRetry(text, toPromptContext(lists));
    const media = extractMedia(html);

    return { ...normalizeRecipe(raw, lists), media };
}

export async function parseRecipeFromImage(base64: string, mimeType: string, userId: string) {
    const lists = await getUserLists(userId);
    const raw = await generateFromImageWithRetry(base64, mimeType, toPromptContext(lists));
    return { ...normalizeRecipe(raw, lists), media: [] };
}

export async function parseRecipeFromText(text: string, userId: string) {
    const lists = await getUserLists(userId);
    const raw = await generateWithRetry(text, toPromptContext(lists));
    return { ...normalizeRecipe(raw, lists), media: [] };
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

    return {
        title: toText(raw.title),
        description: toText(raw.description) || null,
        categoryId: category?.id ?? lists.fallbackCategoryId,
        ingredients,
        steps,
        prepTime: toInteger(raw.prepTime),
        cookTime: toInteger(raw.cookTime),
        servings: toInteger(raw.servings),
        tags: tags.map((tag) => tag.id),
    };
}

async function generateWithRetry(text: string, context: PromptContext, attempt = 1): Promise<RawRecipeAI> {
    try {
        const result = await model.generateContent(recipePrompt(text, context));
        return parseJson(result.response.text());
    } catch (error) {
        return handleRetry(error, attempt, () => generateWithRetry(text, context, attempt + 1));
    }
}

async function generateFromImageWithRetry(base64: string, mimeType: string, context: PromptContext, attempt = 1): Promise<RawRecipeAI> {
    try {
        const result = await model.generateContent([
            {
                inlineData: {
                    mimeType,
                    data: base64,
                },
            },
            { text: recipeImagePrompt(context) },
        ]);
        return parseJson(result.response.text());
    } catch (error) {
        return handleRetry(error, attempt, () => generateFromImageWithRetry(base64, mimeType, context, attempt + 1));
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
