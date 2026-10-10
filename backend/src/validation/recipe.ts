import { z } from "zod";

import { UNIT_CODES } from "@recipe/common";

// Ограничения времени: неделя в минутах (для заготовок и маринадов)
const MAX_MINUTES = 7 * 24 * 60;

const ingredientSchema = z.object({
    name: z.string().trim().min(1).max(200),
    amount: z.number().positive().max(100000).nullable().default(null),
    unit: z.enum(UNIT_CODES).nullable().default(null),
});

const ingredientGroupSchema = z.object({
    title: z.string().nullable(),
    items: z.array(ingredientSchema).min(1),
});

const stepSchema = z.object({
    text: z.string().trim().min(1).max(2000),
    images: z.array(z.string().url()).max(5).default([]),
});

const mediaItemSchema = z.object({
    url: z.string().url(),
    type: z.union([
        z.enum(["image", "video"]),
        z.string().regex(/^video\//),
        z.string().regex(/^image\//)
    ]),
});

const minutesSchema = z.number().int().min(0).max(MAX_MINUTES).nullable().optional();

// Поля без значений по умолчанию: в zod 4 .partial() сохраняет default,
// и PATCH без steps/media/tags затирал бы их пустыми массивами
const recipeShape = {
    title: z.string().min(1).max(100),
    description: z.string().max(1000).nullable().optional(),
    // Без категории рецепт попадает в «Разное»
    categoryId: z.string().cuid().nullable().optional(),
    ingredients: z.array(ingredientGroupSchema).min(1),
    steps: z.array(stepSchema),
    prepTime: minutesSchema,
    cookTime: minutesSchema,
    servings: z.number().int().positive().nullable().optional(),
    sourceUrl: z.string().max(500).optional(),
    source: z.enum(["pinterest", "telegram", "other"]).optional(),
    media: z.array(mediaItemSchema).max(10),
    tags: z.array(z.string().cuid()).max(20),
};

export const createRecipeSchema = z.object({
    ...recipeShape,
    steps: recipeShape.steps.default([]),
    media: recipeShape.media.default([]),
    tags: recipeShape.tags.default([]),
});

export const updateRecipeSchema = z.object(recipeShape).partial();
