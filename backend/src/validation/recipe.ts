import { z } from "zod";

const ingredientGroupSchema = z.object({
    title: z.string().nullable(),
    items: z.array(z.string().min(1)).min(1),
});

const mediaItemSchema = z.object({
    url: z.string().url(),
    type: z.union([
        z.enum(["image", "video"]),
        z.string().regex(/^video\//),
        z.string().regex(/^image\//)
    ]),
});

export const createRecipeSchema = z.object({
    title: z.string().min(1).max(100),
    categoryId: z.string().cuid().nullable().optional(),
    category: z.string().max(50).optional(),
    ingredients: z.array(ingredientGroupSchema).min(1),
    steps: z.array(z.string()).default([]),
    time: z.string().max(50).nullable().optional(),
    servings: z.number().int().positive().nullable().optional(),
    sourceUrl: z.string().max(500).optional(),
    source: z.enum(["pinterest", "telegram", "other"]).optional(),
    media: z.array(mediaItemSchema).max(10).default([]),
    tags: z.array(z.string().cuid()).max(20).default([]),
});

export const updateRecipeSchema = createRecipeSchema.partial();