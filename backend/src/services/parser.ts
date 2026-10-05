import { model } from "../api/gemeni";
import { recipeImagePrompt, recipePrompt } from "../prompts/recipe";
import { ParsedRecipeAI } from "../types/pinterest";
import { extractMedia, extractText, fetchPage } from "../utils/scraper";

const MAX_RETRIES = 3;
const RETRY_DELAY = 2000;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function parseRecipeFromUrl(url: string) {
    const html = await fetchPage(url);
    const text = extractText(html);

    if (!text || text.length < 50) {
        throw new Error("Не удалось извлечь текст со страницы");
    }

    const parsed = await generateWithRetry(text);
    const media = extractMedia(html);

    return { ...parsed, media };
}

export async function parseRecipeFromImage(base64: string, mimeType: string) {
    const parsed = await generateFromImageWithRetry(base64, mimeType);
    return { ...parsed, media: [] };
}

async function generateWithRetry(text: string, attempt = 1): Promise<ParsedRecipeAI> {
    try {
        const result = await model.generateContent(recipePrompt(text));
        const raw = result.response.text();
        const cleaned = raw.replace(/^```json\n?/, "").replace(/\n?```$/, "").trim();
        return JSON.parse(cleaned) as ParsedRecipeAI;
    } catch (error) {
        return handleRetry(error, attempt, () => generateWithRetry(text, attempt + 1));
    }
}

async function generateFromImageWithRetry(base64: string, mimeType: string, attempt = 1): Promise<ParsedRecipeAI> {
    try {
        const result = await model.generateContent([
            {
                inlineData: {
                    mimeType,
                    data: base64,
                },
            },
            { text: recipeImagePrompt() },
        ]);
        const raw = result.response.text();
        const cleaned = raw.replace(/^```json\n?/, "").replace(/\n?```$/, "").trim();
        return JSON.parse(cleaned) as ParsedRecipeAI;
    } catch (error) {
        return handleRetry(error, attempt, () => generateFromImageWithRetry(base64, mimeType, attempt + 1));
    }
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

export async function parseRecipeFromText(text: string) {
    const parsed = await generateWithRetry(text);
    return { ...parsed, media: [] };
}