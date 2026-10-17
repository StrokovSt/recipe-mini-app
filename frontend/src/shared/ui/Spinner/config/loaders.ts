import catMp4 from "@/shared/assets/video/loaders/cat.mp4";
import catWebm from "@/shared/assets/video/loaders/cat.webm";
import catMagnifierMp4 from "@/shared/assets/video/loaders/cat-magnifier.mp4";
import catMagnifierWebm from "@/shared/assets/video/loaders/cat-magnifier.webm";
import catMagnifierPoster from "@/shared/assets/video/loaders/cat-magnifier-poster.webp";
import catPoster from "@/shared/assets/video/loaders/cat-poster.webp";

// Видео лоадеров. Новый лоадер: файлы в assets/video/loaders (name.webm, name.mp4, name-poster.webp) и строка здесь
export interface LoaderVideo {
    // С прозрачностью
    webm: string;
    // Для Safari: webm с прозрачностью он не играет
    mp4: string;
    // Первый кадр, пока само видео не загрузилось
    poster: string;
}

export const LOADERS = {
    cat: { webm: catWebm, mp4: catMp4, poster: catPoster },
    // Распознавание рецепта ИИ
    catMagnifier: { webm: catMagnifierWebm, mp4: catMagnifierMp4, poster: catMagnifierPoster },
} satisfies Record<string, LoaderVideo>;

export type LoaderName = keyof typeof LOADERS;

export const DEFAULT_LOADER: LoaderName = "cat";
