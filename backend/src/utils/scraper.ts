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

export function extractText(html: string): string {
    const $ = cheerio.load(html);

    const jsonLdItems = extractJsonLd(html);

    for (const item of jsonLdItems) {
        const body = item.articleBody || item.description;
        if (body && body.length > 100) {
        return body.trim();
        }
    }

    $("script, style, nav, footer, header, aside, iframe").remove();

    const content =
        $("main, article").first().text() ||
        $("body").text();

    // С запасом: на старых сайтах рецепт идёт после длинного меню
    return content.replace(/\s+/g, " ").trim().slice(0, 15000);
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