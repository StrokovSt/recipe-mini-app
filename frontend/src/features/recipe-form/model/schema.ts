import i18next from "i18next";
import { z } from "zod";

const TITLE_MAX_LENGTH = 100;

// Тексты ошибок берутся из словаря в момент проверки, поэтому они на текущем языке
const ingredientGroupSchema = z.object({
    title: z.string().nullable(),
    items: z.array(z.string().min(1, { error: () => i18next.t("recipeForm:validation.ingredientEmpty") })).min(1, { error: () => i18next.t("recipeForm:validation.groupEmpty") }),
});

const mediaItemSchema = z.object({
    url: z.string().url({ error: () => i18next.t("recipeForm:validation.invalidUrl") }),
    type: z.enum(["image", "video"]),
});


export const recipeSchema = z.object({
    title: z.string()
        .min(1, { error: () => i18next.t("recipeForm:validation.titleRequired") })
        .max(TITLE_MAX_LENGTH, { error: () => i18next.t("recipeForm:validation.titleTooLong", { max: TITLE_MAX_LENGTH }) }),
    categoryId: z.string().nullable().optional(),
    ingredients: z.array(ingredientGroupSchema).min(1, { error: () => i18next.t("recipeForm:validation.ingredientsRequired") }),
    steps: z.array(z.string().refine(s => s.trim() !== "", { error: () => i18next.t("recipeForm:validation.stepEmpty") })).default([]),
    time: z.string().nullable().optional(),
    servings: z.number().int().positive().nullable().optional(),
    tagIds: z.array(z.string()).default([]),
    media: z.array(mediaItemSchema).default([]),
});

export type RecipeFormValues = z.infer<typeof recipeSchema>;
export type IngredientGroupFormValue = z.infer<typeof ingredientGroupSchema>;