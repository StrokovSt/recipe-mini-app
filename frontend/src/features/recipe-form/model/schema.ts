import { z } from "zod";

const ingredientGroupSchema = z.object({
    title: z.string().nullable(),
    items: z.array(z.string().min(1, "Ингредиент не может быть пустым")).min(1, "Группа не может быть пустой"),
});

export const recipeSchema = z.object({
    title: z.string().min(1, "Название обязательно").max(100, "Не более 100 символов"),
    categoryId: z.string().nullable().optional(),
    ingredients: z.array(ingredientGroupSchema).min(1, "Добавьте хотя бы один ингредиент"),
    steps: z.array(z.string()).default([]),
    time: z.string().nullable().optional(),
    servings: z.number().int().positive().nullable().optional(),
    tagIds: z.array(z.string()).default([]),
    
});

export type RecipeFormValues = z.infer<typeof recipeSchema>;
export type IngredientGroupFormValue = z.infer<typeof ingredientGroupSchema>;