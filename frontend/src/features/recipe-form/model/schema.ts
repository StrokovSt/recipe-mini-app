import i18next from "i18next";
import { z } from "zod";

import { type Ingredient, type RecipeStep, UNIT_CODES } from "@recipe/common";

const TITLE_MAX_LENGTH = 100;

// Тексты ошибок берутся из словаря в момент проверки, поэтому они на текущем языке.
// Ингредиенты и шаги необязательны: пустые строки выкидываются при сохранении (dropEmptyRows),
// ошибка только у начатой строки — количество без названия или фото без текста
const ingredientSchema = z.object({
    name: z.string(),
    amount: z.number().positive({ error: () => i18next.t("recipeForm:validation.amountInvalid") }).nullable(),
    unit: z.enum(UNIT_CODES).nullable(),
}).refine(
    (item) => item.name.trim() !== "" || (item.amount === null && item.unit === null),
    { path: ["name"], error: () => i18next.t("recipeForm:validation.ingredientEmpty") },
);

const ingredientGroupSchema = z.object({
    title: z.string().nullable(),
    items: z.array(ingredientSchema),
});

const stepSchema = z.object({
    text: z.string(),
    images: z.array(z.string()),
}).refine(
    (step) => step.text.trim() !== "" || step.images.length === 0,
    { path: ["text"], error: () => i18next.t("recipeForm:validation.stepEmpty") },
);

export const EMPTY_INGREDIENT: Ingredient = { name: "", amount: null, unit: null };
export const EMPTY_STEP: RecipeStep = { text: "", images: [] };

// Пустая строка удаляется молча, без «Вернуть»
export const isEmptyIngredient = (item: Ingredient) =>
    item.name.trim() === "" && item.amount === null && item.unit === null;

export const recipeSchema = z.object({
    title: z.string()
        .min(1, { error: () => i18next.t("recipeForm:validation.titleRequired") })
        .max(TITLE_MAX_LENGTH, { error: () => i18next.t("recipeForm:validation.titleTooLong", { max: TITLE_MAX_LENGTH }) }),
    description: z.string().nullable().optional(),
    categoryId: z.string().nullable().optional(),
    ingredients: z.array(ingredientGroupSchema),
    steps: z.array(stepSchema).default([]),
    // Время подготовки и готовки в минутах
    prepTime: z.number().int().min(0).nullable().optional(),
    cookTime: z.number().int().min(0).nullable().optional(),
    servings: z.number().int().positive().nullable().optional(),
    // КБЖУ на одну порцию, все необязательные
    calories: z.number().int().min(0).nullable().optional(),
    protein: z.number().int().min(0).nullable().optional(),
    fat: z.number().int().min(0).nullable().optional(),
    carbs: z.number().int().min(0).nullable().optional(),
    tagIds: z.array(z.string()).default([]),
    cover: z.string().nullable(),
    // Видео из импорта (Pinterest). В форме не показывается, но сохраняется вместе с рецептом
    video: z.string().nullable().optional(),
});

export type RecipeFormValues = z.infer<typeof recipeSchema>;
export type IngredientGroupFormValue = z.infer<typeof ingredientGroupSchema>;

// Пустая форма нового рецепта
export const EMPTY_FORM_VALUES: RecipeFormValues = {
    title: "",
    description: null,
    categoryId: null,
    ingredients: [{ title: null, items: [EMPTY_INGREDIENT] }],
    steps: [EMPTY_STEP],
    prepTime: null,
    cookTime: null,
    // По умолчанию одна порция
    servings: 1,
    calories: null,
    protein: null,
    fat: null,
    carbs: null,
    tagIds: [],
    cover: null,
    video: null,
};

// Перед сохранением: без пустых строк ингредиентов, пустых групп и пустых шагов
export const dropEmptyRows = (values: RecipeFormValues): RecipeFormValues => ({
    ...values,
    ingredients: values.ingredients
        .map((group) => ({ ...group, items: group.items.filter((item) => item.name.trim() !== "") }))
        .filter((group) => group.items.length > 0),
    steps: values.steps.filter((step) => step.text.trim() !== "" || step.images.length > 0),
});
