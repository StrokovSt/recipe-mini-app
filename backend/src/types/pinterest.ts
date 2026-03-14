import type { MediaType, ParsedRecipe } from "@recipe/common";

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

export type ParsedRecipeAI = Omit<ParsedRecipe, "media" | "source" | "sourceUrl">;

export type MediaItem = {
    url: string;
    type: MediaType;
};