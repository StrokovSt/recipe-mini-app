import type { MediaInput } from "@recipe/common";

// В форме обложка — одна картинка, на сервере это первая картинка в media
export const getCover = (media: MediaInput[]): string | null =>
    media.find((item) => item.type === "image")?.url ?? null;

export const toMedia = (cover: string | null): MediaInput[] =>
    cover ? [{ url: cover, type: "image" }] : [];
