export interface PinterestJsonLd {
    articleBody?: string;
    description?: string;
    headline?: string;
    name?: string;
    image?: string;
    thumbnailUrl?: string;
    contentUrl?: string;
    keywords?: string;
}

export type MediaItem = {
    url: string;
    type: "image" | "video";
};
