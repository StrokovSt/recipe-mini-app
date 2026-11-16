import axios from "axios";

// Что достаём из ролика: текст для ИИ, длительность и обложку
export interface YoutubeVideo {
    // Ссылка в обычном виде: её понимает Gemini
    url: string;
    title: string;
    description: string;
    // Комментарии автора ролика: рецепт часто лежит в закреплённом комментарии
    comments: string;
    // Секунды, 0 — узнать не удалось
    duration: number;
    cover: string | null;
}

const ID_PATTERN = /^[\w-]{11}$/;

// youtube.com/watch?v=…, /shorts/…, /live/…, /embed/…, m.youtube.com, music.youtube.com и короткие youtu.be/…
export function getYoutubeId(url: string): string | null {
    try {
        const { hostname, pathname, searchParams } = new URL(url);
        const host = hostname.toLowerCase().replace(/^(www|m|music)\./, "");
        const [first, second] = pathname.split("/").filter(Boolean);

        const id =
            host === "youtu.be" ? first
            : host !== "youtube.com" && host !== "youtube-nocookie.com" ? null
            : first === "watch" ? searchParams.get("v")
            : ["shorts", "live", "embed", "v"].includes(first) ? second
            : null;

        return id && ID_PATTERN.test(id) ? id : null;
    } catch {
        return null;
    }
}

export const isYoutubeUrl = (url: string) => getYoutubeId(url) !== null;

// Объект JSON, который начинается в тексте с позиции start: считаем скобки, пропуская строки
function readJsonObject(source: string, start: number): unknown {
    let depth = 0;
    let inString = false;

    for (let index = start; index < source.length; index += 1) {
        const char = source[index];

        if (inString) {
            if (char === "\\") index += 1;
            else if (char === '"') inString = false;
            continue;
        }

        if (char === '"') inString = true;
        else if (char === "{") depth += 1;
        else if (char === "}") {
            depth -= 1;
            if (depth === 0) return JSON.parse(source.slice(start, index + 1));
        }
    }

    return null;
}

interface PlayerResponse {
    videoDetails?: {
        title?: string;
        shortDescription?: string;
        lengthSeconds?: string;
        thumbnail?: { thumbnails?: { url?: string; width?: number }[] };
    };
}

// Данные ролика лежат на странице в переменной ytInitialPlayerResponse
function readPlayerResponse(html: string): PlayerResponse["videoDetails"] {
    const marker = html.indexOf("ytInitialPlayerResponse = {");
    if (marker === -1) return undefined;

    try {
        return (readJsonObject(html, html.indexOf("{", marker)) as PlayerResponse | null)?.videoDetails;
    } catch {
        return undefined;
    }
}

const API_URL = "https://www.googleapis.com/youtube/v3";
// Короче этого — не рецепт, а «спасибо за просмотр»
const MIN_COMMENT_LENGTH = 80;

interface ApiVideo {
    snippet?: {
        title?: string;
        description?: string;
        channelId?: string;
        thumbnails?: Record<string, { url?: string; width?: number }>;
    };
    contentDetails?: { duration?: string };
}

interface ApiCommentThread {
    snippet?: { topLevelComment?: { snippet?: { textOriginal?: string; authorChannelId?: { value?: string } } } };
}

// PT1H2M30S → секунды
const toSeconds = (value = "") => {
    const match = value.match(/^P(?:(\d+)D)?T?(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    return match ? Number(match[1] ?? 0) * 86400 + Number(match[2] ?? 0) * 3600 + Number(match[3] ?? 0) * 60 + Number(match[4] ?? 0) : 0;
};

// Комментарии автора ролика среди первых двадцати: закреплённый комментарий идёт первым.
// Комментарии закрыты или запрос не прошёл — обходимся без них
async function fetchAuthorComments(id: string, channelId: string, key: string): Promise<string> {
    try {
        const { data } = await axios.get<{ items?: ApiCommentThread[] }>(`${API_URL}/commentThreads`, {
            params: { part: "snippet", videoId: id, order: "relevance", maxResults: 20, textFormat: "plainText", key },
            timeout: 10000,
        });

        return (data.items ?? [])
            .map((item) => item.snippet?.topLevelComment?.snippet)
            .filter((comment) => comment?.authorChannelId?.value === channelId)
            .map((comment) => comment?.textOriginal?.trim() ?? "")
            .filter((text) => text.length >= MIN_COMMENT_LENGTH)
            .join("\n\n");
    } catch (error) {
        console.warn("Не удалось получить комментарии YouTube:", error instanceof Error ? error.message : error);
        return "";
    }
}

// Официальный API YouTube: данные ролика и комментарии автора. null — ролик не найден или запрос не прошёл
async function fetchFromApi(id: string, url: string, key: string): Promise<YoutubeVideo | null> {
    try {
        const { data } = await axios.get<{ items?: ApiVideo[] }>(`${API_URL}/videos`, {
            params: { part: "snippet,contentDetails", id, key },
            timeout: 10000,
        });
        const video = data.items?.[0];
        if (!video?.snippet) return null;

        const { title, description, channelId, thumbnails } = video.snippet;
        const covers = Object.values(thumbnails ?? {}).sort((a, b) => (b.width ?? 0) - (a.width ?? 0));

        return {
            url,
            title: title?.trim() ?? "",
            description: description?.trim() ?? "",
            comments: channelId ? await fetchAuthorComments(id, channelId, key) : "",
            duration: toSeconds(video.contentDetails?.duration),
            cover: covers[0]?.url ?? null,
        };
    } catch (error) {
        console.warn("API YouTube не ответил:", error instanceof Error ? error.message : error);
        return null;
    }
}

// Название, описание автора, длительность и обложка. С ключом YOUTUBE_API_KEY берём их через официальный API
// вместе с комментариями автора. Без ключа — со страницы ролика, без комментариев. Страница не открылась или изменилась — берём хотя бы название
// и обложку из oEmbed; не вышло и это — остаётся одна ссылка, рецепт ИИ возьмёт из самого видео
export async function fetchYoutubeVideo(id: string): Promise<YoutubeVideo> {
    const url = `https://www.youtube.com/watch?v=${id}`;
    const fallbackCover = `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;

    const key = process.env.YOUTUBE_API_KEY;
    const fromApi = key ? await fetchFromApi(id, url, key) : null;
    if (fromApi) return { ...fromApi, cover: fromApi.cover ?? fallbackCover };

    try {
        const { data } = await axios.get<string>(url, {
            responseType: "text",
            timeout: 15000,
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
                "Accept-Language": "en-US,en;q=0.9",
                // Без согласия на cookies из Европы приходит страница-заглушка
                Cookie: "SOCS=CAI; CONSENT=YES+1",
            },
        });
        const details = readPlayerResponse(data);

        if (details) {
            const thumbnails = [...(details.thumbnail?.thumbnails ?? [])].sort((a, b) => (b.width ?? 0) - (a.width ?? 0));

            return {
                url,
                title: details.title?.trim() ?? "",
                description: details.shortDescription?.trim() ?? "",
                comments: "",
                duration: Number(details.lengthSeconds) || 0,
                cover: thumbnails[0]?.url ?? fallbackCover,
            };
        }
    } catch (error) {
        console.warn("Не удалось открыть страницу YouTube:", error instanceof Error ? error.message : error);
    }

    try {
        const { data } = await axios.get<{ title?: string; thumbnail_url?: string }>("https://www.youtube.com/oembed", {
            params: { url, format: "json" },
            timeout: 10000,
        });
        return { url, title: data.title?.trim() ?? "", description: "", comments: "", duration: 0, cover: data.thumbnail_url ?? fallbackCover };
    } catch {
        return { url, title: "", description: "", comments: "", duration: 0, cover: fallbackCover };
    }
}

// Текст для ИИ: название, описание и комментарии автора
export const youtubeToText = (video: YoutubeVideo) =>
    [
        video.title && `Title: ${video.title}`,
        video.description && `Description:\n${video.description}`,
        video.comments && `Author's comments under the video:\n${video.comments}`,
    ]
        .filter(Boolean)
        .join("\n\n");
