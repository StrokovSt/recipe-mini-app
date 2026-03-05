import axios from "axios";
import * as cheerio from "cheerio";

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

export async function fetchPage(url: string): Promise<string> {
    const { data } = await client.get(url);
    return data;
}

export function extractText(html: string): string {
    const $ = cheerio.load(html);

    $("script, style, nav, footer, header, aside, iframe").remove();

    const content =
        $("main, article").first().text() ||
        $("body").text();

    return content.replace(/\s+/g, " ").trim().slice(0, 4000);
}

export type MediaItem = {
    url: string;
    type: "image" | "video";
};

export function extractMedia(html: string): MediaItem[] {
    const $ = cheerio.load(html);
    const media: MediaItem[] = [];

    // OG изображение (главное)
    const ogImage = $('meta[property="og:image"]').attr("content");
    if (ogImage) media.push({ url: ogImage, type: "image" });

    // OG видео
    const ogVideo = $('meta[property="og:video"]').attr("content");
    if (ogVideo) media.push({ url: ogVideo, type: "video" });

    // Twitter
    const twitterImage = $('meta[name="twitter:image"]').attr("content");
    if (twitterImage && twitterImage !== ogImage) {
        media.push({ url: twitterImage, type: "image" });
    }

    // Все картинки из основного контента
    $("main img, article img").each((_i, el) => {
        const src = $(el).attr("src");
        if (src && !media.find((m) => m.url === src)) {
        media.push({ url: src, type: "image" });
        }
    });

    // Видео теги
    $("main video, article video").each((_i, el) => {
        const src = $(el).attr("src") || $(el).find("source").attr("src");
        if (src && !media.find((m) => m.url === src)) {
        media.push({ url: src, type: "video" });
        }
    });

    return media;
}