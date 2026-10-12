import axios from "axios";

import { extractJsonLd } from "../utils/scraper";

// Что достаём из пина: текст для ИИ и медиа
export interface PinData {
    title: string;
    description: string;
    captionsUrl: string | null;
    cover: string | null;
    video: string | null;
}

interface PinJsonLd {
    "@type"?: string;
    headline?: string;
    name?: string;
    articleBody?: string;
    description?: string;
    image?: string;
    thumbnailUrl?: string;
    contentUrl?: string;
    caption?: { contentUrl?: string };
}

// pinterest.com, ru.pinterest.com, pinterest.co.uk… и короткие ссылки pin.it
export function isPinterestUrl(url: string) {
    try {
        const host = new URL(url).hostname.toLowerCase();
        return host === "pin.it" || /(^|\.)pinterest\.[a-z.]+$/.test(host);
    } catch {
        return false;
    }
}

const text = (value: unknown) => (typeof value === "string" ? value.trim() : "");

// Pinterest иногда приклеивает к описанию дату: «21 авг. 2026 г. — 70 мл масла…»
const stripDatePrefix = (value: string) => value.replace(/^[^\n—]{0,25}\d{4}[^\n—]{0,5}—\s*/, "");

// Описание в JSON-LD бывает обрезано многоточием, тогда берём более длинное из двух
const longest = (...values: string[]) => values.reduce((a, b) => (b.length > a.length ? b : a), "");

// Данные пина из JSON-LD: SocialMediaPosting (текст, картинка) и VideoObject (видео, превью, субтитры)
export function extractPin(html: string): PinData {
    const items = extractJsonLd(html) as PinJsonLd[];
    const post = items.find((item) => item["@type"] === "SocialMediaPosting") ?? {};
    const video = items.find((item) => item["@type"] === "VideoObject") ?? {};

    return {
        title: text(post.headline) || text(video.name),
        description: stripDatePrefix(longest(text(post.articleBody), text(video.description))),
        captionsUrl: text(video.caption?.contentUrl) || null,
        cover: text(post.image) || text(video.thumbnailUrl) || null,
        video: text(video.contentUrl) || null,
    };
}

// HLS (.m3u8) Chrome сам не играет. У mp4 тот же хэш:
// videos/iht/hls/56/32/b5/<hash>.m3u8 → videos/iht/expMp4/56/32/b5/<hash>_720w.mp4
export async function toPlayableVideo(url: string): Promise<string> {
    const match = url.match(/^(https:\/\/v\d*\.pinimg\.com\/videos\/)(?:iht\/)?hls\/(.+)\.m3u8$/);
    if (!match) return url;

    const mp4 = `${match[1]}iht/expMp4/${match[2]}_720w.mp4`;

    try {
        await axios.head(mp4, { timeout: 5000 });
        return mp4;
    } catch {
        return url;
    }
}

// Субтитры видео (WebVTT) → обычный текст без таймингов и повторов
export async function fetchCaptions(url: string): Promise<string> {
    try {
        const { data } = await axios.get<string>(url, { timeout: 5000, responseType: "text" });
        const lines = data
            .split(/\r?\n/)
            .map((line) => line.replace(/<[^>]+>/g, "").trim())
            .filter((line) => line && line !== "WEBVTT" && !line.includes("-->") && !/^\d+$/.test(line) && !/^(NOTE|STYLE|Kind:|Language:)/.test(line));

        return lines.filter((line, index) => line !== lines[index - 1]).join(" ");
    } catch (error) {
        console.warn("Не удалось скачать субтитры:", error instanceof Error ? error.message : error);
        return "";
    }
}

// Текст для ИИ: название, описание автора и речь из видео
export const pinToText = (pin: PinData, captions: string) =>
    [
        pin.title && `Название: ${pin.title}`,
        pin.description && `Описание:\n${pin.description}`,
        captions && `Субтитры видео (речь автора):\n${captions}`,
    ]
        .filter(Boolean)
        .join("\n\n");
