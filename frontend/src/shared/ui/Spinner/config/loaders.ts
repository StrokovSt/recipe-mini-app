import catWebm from "@/shared/assets/video/loaders/cat.webm";
import catHevc from "@/shared/assets/video/loaders/cat-hevc.mp4";
import catMagnifierWebm from "@/shared/assets/video/loaders/cat-magnifier.webm";
import catMagnifierHevc from "@/shared/assets/video/loaders/cat-magnifier-hevc.mp4";
import catMagnifierPoster from "@/shared/assets/video/loaders/cat-magnifier-poster.webp";
import catPoster from "@/shared/assets/video/loaders/cat-poster.webp";

// Видео лоадеров. Новый лоадер: файлы в assets/video/loaders (name.webm, name-hevc.mp4, name-poster.webp) и строка здесь
export interface LoaderVideo {
    // VP9 с прозрачностью: Chrome, Firefox, Android
    webm: string;
    // HEVC с прозрачностью для браузеров Apple: прозрачность WebM они не показывают, фон выходит чёрным
    hevc: string;
    // Первый кадр, пока само видео не загрузилось
    poster: string;
}

export const LOADERS = {
    cat: { webm: catWebm, hevc: catHevc, poster: catPoster },
    // Распознавание рецепта ИИ
    catMagnifier: { webm: catMagnifierWebm, hevc: catMagnifierHevc, poster: catMagnifierPoster },
} satisfies Record<string, LoaderVideo>;

export type LoaderName = keyof typeof LOADERS;

export const DEFAULT_LOADER: LoaderName = "cat";
