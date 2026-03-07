export type MediaType = "image" | "video";

export interface Media {
    id: string;
    url: string;
    type: MediaType;
    order: number;
}

export interface Tag {
    id: string;
    name: string;
}

export interface RecipeTag {
    tagId: string;
    tag: Tag;
}

export interface Category {
    id: string;
    name: string;
    userId: string;
}

export type RecipeSource = "pinterest" | "telegram" | "other";

export interface Recipe {
    id: string;
    userId: string;
    title: string;
    categoryId: string | null;
    category: Category | null;
    ingredients: string[];
    steps: string[];
    time: string | null;
    servings: number | null;
    sourceUrl: string;
    source: RecipeSource;
    telegraphUrl: string | null;
    media: Media[];
    tags: RecipeTag[];
    createdAt: string;
    updatedAt: string;
}

export type RecipeOmitFields = "id" | "userId" | "category" | "categoryId" | "telegraphUrl" | "createdAt" | "updatedAt" | "tags";

export type CreateRecipeDto = Omit<Recipe, RecipeOmitFields> & {
    categoryId?: string | null;
    category?: string;
    tags: string[];
};

export interface ParsedRecipe {
    title: string;
    category?: string;
    ingredients: string[];
    steps: string[];
    time: string | null;
    servings: number | null;
    media: Media[];
    tags: string[];
    source: RecipeSource;
    sourceUrl: string;
}