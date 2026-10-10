import i18next from "i18next";
import { z } from "zod";

import { type Ingredient, type RecipeStep, UNIT_CODES } from "@recipe/common";

const TITLE_MAX_LENGTH = 100;

// Тексты ошибок берутся из словаря в момент проверки, поэтому они на текущем языке
const ingredientSchema = z.object({
    name: z.string().trim().min(1, { error: () => i18next.t("recipeForm:validation.ingredientEmpty") }),
    amount: z.number().nullable(),
    unit: z.enum(UNIT_CODES).nullable(),
});

const ingredientGroupSchema = z.object({
    title: z.string().nullable(),
    items: z.array(ingredientSchema).min(1, { error: () => i18next.t("recipeForm:validation.groupEmpty") }),
});

const stepSchema = z.object({
    text: z.string().refine(s => s.trim() !== "", { error: () => i18next.t("recipeForm:validation.stepEmpty") }),
    images: z.array(z.string()),
});

export const EMPTY_INGREDIENT: Ingredient = { name: "", amount: null, unit: null };
export const EMPTY_STEP: RecipeStep = { text: "", images: [] };

const mediaItemSchema = z.object({
    url: z.string().url({ error: () => i18next.t("recipeForm:validation.invalidUrl") }),
    type: z.enum(["image", "video"]),
});


export const recipeSchema = z.object({
    title: z.string()
        .min(1, { error: () => i18next.t("recipeForm:validation.titleRequired") })
        .max(TITLE_MAX_LENGTH, { error: () => i18next.t("recipeForm:validation.titleTooLong", { max: TITLE_MAX_LENGTH }) }),
    description: z.string().nullable().optional(),
    categoryId: z.string().nullable().optional(),
    ingredients: z.array(ingredientGroupSchema).min(1, { error: () => i18next.t("recipeForm:validation.ingredientsRequired") }),
    steps: z.array(stepSchema).default([]),
    // Время в минутах. Поля подготовки в форме пока нет, значение сохраняется как пришло
    prepTime: z.number().int().min(0).nullable().optional(),
    cookTime: z.number().int().min(0).nullable().optional(),
    servings: z.number().int().positive().nullable().optional(),
    tagIds: z.array(z.string()).default([]),
    media: z.array(mediaItemSchema).default([]),
});

export type RecipeFormValues = z.infer<typeof recipeSchema>;
export type IngredientGroupFormValue = z.infer<typeof ingredientGroupSchema>;