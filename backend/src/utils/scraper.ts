import axios from "axios";
import * as cheerio from "cheerio";

import { MediaType} from "@recipe/common";

import { MediaItem, PinterestJsonLd } from "../types/pinterest";

const USER_AGENT = "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1";

const client = axios.create({
    headers: {
        "User-Agent": USER_AGENT,
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
        "Accept-Language": "ru-RU,ru;q=0.9,en;q=0.8",
        "Accept-Encoding": "gzip, deflate, br",
        "Connection": "keep-alive",
        "Upgrade-Insecure-Requests": "1",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "none",
        "Sec-Fetch-User": "?1",
        "Cache-Control": "max-age=0",
    },
    timeout: 10000,
});

// Старые сайты (russianfood и т.п.) отдают windows-1251: кодировку берём из заголовка или <meta>, иначе UTF-8
export async function fetchPage(url: string): Promise<string> {
    const { data, headers } = await client.get<ArrayBuffer>(url, { responseType: "arraybuffer" });
    const buffer = Buffer.from(data);
    const head = buffer.subarray(0, 2048).toString("latin1");
    const charset = (String(headers["content-type"] ?? "").match(/charset=([\w-]+)/i) ?? head.match(/charset=["']?([\w-]+)/i))?.[1];

    try {
        return new TextDecoder(charset ?? "utf-8").decode(buffer);
    } catch {
        return buffer.toString("utf-8");
    }
}

const toAbsoluteUrl = (value: string, pageUrl: string) => {
    try {
        return value ? new URL(value, pageUrl).href : null;
    } catch {
        return null;
    }
};

export function extractJsonLd(html: string): PinterestJsonLd[] {
    const $ = cheerio.load(html);
    const results: PinterestJsonLd[] = [];

    $('script[type="application/ld+json"]').each((_i, el) => {
        try {
            const json = JSON.parse($(el).html() || "");
            results.push(json);
        } catch (error) {
            console.warn("Failed to parse JSON-LD:", error instanceof Error ? error.message : error);
        }
    });

    return results;
}

type JsonLdNode = Record<string, unknown>;

const asArray = <T>(value: T | T[] | null | undefined): T[] => (Array.isArray(value) ? value : value == null ? [] : [value]);

const asText = (value: unknown): string =>
    typeof value === "string" || typeof value === "number" ? cheerio.load(`<i>${value}</i>`)("i").text().replace(/\s+/g, " ").trim() : "";

const isType = (node: JsonLdNode, type: string) => asArray(node["@type"]).includes(type);

// Рецепт в разметке schema.org лежит где угодно: на верхнем уровне, в массиве или в @graph (WordPress)
function findRecipeNode(items: unknown[]): JsonLdNode | null {
    for (const item of items.flatMap((entry) => asArray(entry))) {
        if (!item || typeof item !== "object") continue;

        const node = item as JsonLdNode;
        if (isType(node, "Recipe")) return node;

        const nested = findRecipeNode(asArray(node["@graph"]));
        if (nested) return nested;
    }

    return null;
}

// PT1H30M → 90 (минуты)
const toMinutes = (value: unknown) => {
    const match = typeof value === "string" ? value.match(/^P(?:(\d+)D)?T?(?:(\d+)H)?(?:(\d+)M)?/) : null;
    const minutes = match ? Number(match[1] ?? 0) * 1440 + Number(match[2] ?? 0) * 60 + Number(match[3] ?? 0) : 0;
    return minutes > 0 ? `${minutes} min` : "";
};

// Шаги: строка, HowToStep или раздел HowToSection со своими шагами
const toStepLines = (value: unknown): string[] =>
    asArray(value).flatMap((step) => {
        if (typeof step === "string") return asText(step) ? [asText(step)] : [];
        if (!step || typeof step !== "object") return [];

        const node = step as JsonLdNode;
        if (node.itemListElement) return [asText(node.name) && `[${asText(node.name)}]`, ...toStepLines(node.itemListElement)].filter(Boolean) as string[];

        const text = asText(node.text) || asText(node.name);
        return text ? [text] : [];
    });

const NUTRITION_FIELDS = ["servingSize", "calories", "proteinContent", "fatContent", "carbohydrateContent"];

// Рецепт из разметки schema.org → чистый текст для ИИ. null — разметки нет или в ней нет ингредиентов
export function extractRecipeText(html: string): { text: string; complete: boolean } | null {
    const recipe = findRecipeNode(extractJsonLd(html));
    if (!recipe) return null;

    const ingredients = asArray(recipe.recipeIngredient ?? recipe.ingredients).map(asText).filter(Boolean);
    if (ingredients.length === 0) return null;

    const steps = toStepLines(recipe.recipeInstructions);
    const nutrition = (recipe.nutrition ?? {}) as JsonLdNode;
    const nutritionLine = NUTRITION_FIELDS.map((field) => asText(nutrition[field]) && `${field}: ${asText(nutrition[field])}`).filter(Boolean).join(", ");

    const lines = [
        ["Title", asText(recipe.name)],
        ["Description", asText(recipe.description)],
        ["Category", asArray(recipe.recipeCategory).map(asText).join(", ")],
        ["Cuisine", asArray(recipe.recipeCuisine).map(asText).join(", ")],
        ["Keywords", asArray(recipe.keywords).map(asText).join(", ")],
        ["Servings", asArray(recipe.recipeYield).map(asText).join(", ")],
        ["Prep time", toMinutes(recipe.prepTime)],
        ["Cook time", toMinutes(recipe.cookTime)],
        ["Total time", toMinutes(recipe.totalTime)],
        ["Nutrition", nutritionLine],
        ["Ingredients", `\n${ingredients.map((line) => `- ${line}`).join("\n")}`],
        ["Steps", steps.length ? `\n${steps.map((line) => (line.startsWith("[") ? line : `- ${line}`)).join("\n")}` : ""],
    ];

    return {
        text: lines.filter(([, value]) => value).map(([label, value]) => `${label}: ${value}`).join("\n"),
        complete: steps.length > 0,
    };
}

const PAGE_TEXT_LIMIT = 15000;

// Текст статьи со строками: списки ингредиентов не слипаются в одну строку
function extractPageText(html: string): string {
    const $ = cheerio.load(html);

    $("script, style, noscript, svg, nav, footer, header, aside, iframe, form, button, [class*='comment'], #comments").remove();
    $("br").replaceWith("\n");
    $("p, li, div, tr, h1, h2, h3, h4, h5, h6").append("\n");
    $("td, th").append(" ");

    const content = $("main, article").first().text() || $("body").text();

    return content
        .split("\n")
        .map((line) => line.replace(/\s+/g, " ").trim())
        .filter(Boolean)
        .join("\n")
        // С запасом: на старых сайтах рецепт идёт после длинного меню
        .slice(0, PAGE_TEXT_LIMIT);
}

// Текст страницы для ИИ. Сначала разметка рецепта schema.org: в ней нет мусора, ингредиенты и шаги уже списками.
// Если в разметке нет шагов — добавляем текст страницы. Разметки нет — только текст страницы
export function extractText(html: string): string {
    const recipe = extractRecipeText(html);
    if (recipe?.complete) return recipe.text;

    const page = extractPageText(html);
    if (recipe) return `${recipe.text}\n\nPAGE TEXT:\n${page}`.slice(0, PAGE_TEXT_LIMIT);

    // Страница собирается скриптами, а текст статьи лежит только в разметке
    const article = extractJsonLd(html).map((item) => item.articleBody?.trim() ?? "").find((body) => body.length > page.length);

    return article ?? page;
}

// pageUrl нужен для относительных ссылок: «//site.com/img.jpg», «/img.jpg»
export function extractMedia(html: string, pageUrl: string): MediaItem[] {
    const $ = cheerio.load(html);
    const media: MediaItem[] = [];
    const seen = new Set<string>();

    const add = (value: string, type: MediaType) => {
        const url = toAbsoluteUrl(value, pageUrl);
        if (url && !seen.has(url)) {
        seen.add(url);
        media.push({ url, type });
        }
    };

    // Из JSON-LD — самое качественное медиа
    const jsonLdItems = extractJsonLd(html);
    for (const item of jsonLdItems) {
        if (item.contentUrl) add(item.contentUrl, "video");
        if (item.thumbnailUrl) add(item.thumbnailUrl, "image");
        if (item.image) add(item.image, "image");
    }

    // Fallback только если JSON-LD ничего не дал
    if (media.length === 0) {
        const ogVideo = $('meta[property="og:video"]').attr("content");
        const ogImage = $('meta[property="og:image"]').attr("content");
        const twitterImage = $('meta[name="twitter:image"]').attr("content");

        if (ogVideo) add(ogVideo, "video");
        if (ogImage) add(ogImage, "image");
        if (twitterImage) add(twitterImage, "image");
    }

    return media;
}