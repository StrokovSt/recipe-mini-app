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

export interface ParsedRecipeAI {
    title: string;
    ingredients: string[];
    steps: string[];
    time: string | null;
    servings: number | null;
    tags: string[];
    error?: string;
}

export type MediaItem = {
    url: string;
    type: "image" | "video";
};
