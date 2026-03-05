import { model } from "../api/gemeni";
import { recipePrompt } from "../prompts/recipe";
import { extractMedia, extractText, fetchPage } from "../utils/scraper";

export async function parseRecipeFromUrl(url: string) {
    const html = await fetchPage(url);
    const text = extractText(html);

    if (!text || text.length < 50) {
        throw new Error("Не удалось извлечь текст со страницы");
    }

    const result = await model.generateContent(recipePrompt(text));
    const raw = result.response.text();
    const cleaned = raw.replace(/^```json\n?/, "").replace(/\n?```$/, "").trim();
    const parsed = JSON.parse(cleaned);

    if (parsed.error) {
        throw new Error(parsed.error);
    }

    const media = extractMedia(html);

    return { ...parsed, media };
}