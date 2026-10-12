import type { MediaInput } from "@recipe/common";

// В форме обложка — одна картинка, на сервере это первая картинка в media
export const getCover = (media: MediaInput[]): string | null =>
    media.find((item) => item.type === "image")?.url ?? null;

// Видео у рецепта одно: первое видео в media
export const getVideo = (media: MediaInput[]): string | null =>
    media.find((item) => item.type === "video")?.url ?? null;

export const toMedia = (cover: string | null, video?: string | null): MediaInput[] => [
    ...(cover ? [{ url: cover, type: "image" as const }] : []),
    ...(video ? [{ url: video, type: "video" as const }] : []),
];
