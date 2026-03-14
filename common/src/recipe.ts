export type MediaType = "image" | "video";

export interface Media {
    id: string;
    url: string;
    type: MediaType;
    order: number;
}

export interface MediaInput {
    url: string;
    type: MediaType;
}

export interface IngredientGroup {
    title: string | null;
    items: string[];
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
    ingredients: IngredientGroup[];
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

export type RecipeOmitFields = "id" | "userId" | "category" | "categoryId" | "telegraphUrl" | "createdAt" | "updatedAt" | "tags" | "media";

export type CreateRecipeDto = Omit<Recipe, RecipeOmitFields> & {
    categoryId?: string | null;
    category?: string;
    tags: string[];
    media: MediaInput[];
};

export interface ParsedRecipe {
    title: string;
    category?: string;
    ingredients: IngredientGroup[];
    steps: string[];
    time: string | null;
    servings: number | null;
    media: Media[];
    tags: string[];
    source: RecipeSource;
    sourceUrl: string;
}