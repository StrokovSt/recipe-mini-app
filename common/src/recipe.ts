import type { UnitCode } from "./units";

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

// amount — число (диапазон «2–3» хранится нижним числом), unit — код из UNITS.
// «По вкусу» — unit "to_taste" без amount
export interface Ingredient {
    name: string;
    amount: number | null;
    unit: UnitCode | null;
}

export interface IngredientGroup {
    title: string | null;
    items: Ingredient[];
}

// images — ссылки на фото к шагу
export interface RecipeStep {
    text: string;
    images: string[];
}

export interface Tag {
    id: string;
    name: string;
    // Количество рецептов с тегом, приходит только в GET /api/tags
    recipeCount?: number;
}

export interface RecipeTag {
    tagId: string;
    tag: Tag;
}

export interface Category {
    id: string;
    name: string;
    userId: string;
    iconName?: string;
    // Резервная категория «Разное»: её нельзя удалить, сюда попадают рецепты без категории
    isDefault: boolean;
    // Количество рецептов в категории, приходит только в GET /api/categories
    recipeCount?: number;
}

export type RecipeSource = "pinterest" | "telegram" | "other";

export interface Recipe {
    id: string;
    userId: string;
    title: string;
    description: string | null;
    categoryId: string;
    category: Category;
    ingredients: IngredientGroup[];
    steps: RecipeStep[];
    // Время в минутах
    prepTime: number | null;
    cookTime: number | null;
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

// Без categoryId рецепт попадает в «Разное». tags — id существующих тегов пользователя
export type CreateRecipeDto = Omit<Recipe, RecipeOmitFields> & {
    categoryId?: string | null;
    tags: string[];
    media: MediaInput[];
};

// Результат распознавания: категорию и теги AI выбирает из списков пользователя,
// поэтому здесь уже id (categoryId — «Разное», если ничего не подошло)
export type ParsedRecipe = Omit<CreateRecipeDto, "categoryId"> & {
    categoryId: string;
};