import { model } from "../api/gemeni";
import { recipePrompt } from "../prompts/recipe";
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

async function generateWithRetry(text: string, attempt = 1): Promise<ParsedRecipeAI> {
    try {
        const result = await model.generateContent(recipePrompt(text));
        const raw = result.response.text();
        const cleaned = raw.replace(/^```json\n?/, "").replace(/\n?```$/, "").trim();
        const parsed = JSON.parse(cleaned) as ParsedRecipeAI;

        if (parsed.error) {
        throw new Error(parsed.error);
        }

        return parsed;
    } 
    catch (error) {
        const message = error instanceof Error ? error.message : "";
        const is503 = message.includes("503");
        const is429 = message.includes("429");

        if (is503 && attempt < MAX_RETRIES) {
            console.warn(`Gemini 503, повтор ${attempt}/${MAX_RETRIES} через ${RETRY_DELAY * attempt}ms...`);
            await sleep(RETRY_DELAY * attempt);
            return generateWithRetry(text, attempt + 1);
        }

        if (is429) {
            const retryMatch = message.match(/retryDelay.*?(\d+)s/);
            const retryAfter = retryMatch ? parseInt(retryMatch[1]) * 1000 : 60000;
            throw new Error(`QUOTA_EXCEEDED:${retryAfter}`);
        }

        throw error;
    }
}