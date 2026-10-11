import type { ParsedRecipe } from "@recipe/common";

import { getCover } from "./cover";
import { EMPTY_INGREDIENT, EMPTY_STEP, type RecipeFormValues } from "./schema";

// Распознанный ИИ рецепт как начальные значения формы. Если ИИ не нашёл ингредиенты или шаги,
// в форме остаётся пустая строка, как при ручном создании
export const parsedToFormValues = (data: ParsedRecipe): Partial<RecipeFormValues> => ({
    title: data.title,
    description: data.description,
    categoryId: data.categoryId,
    ingredients: data.ingredients.length > 0 ? data.ingredients : [{ title: null, items: [EMPTY_INGREDIENT] }],
    steps: data.steps.length > 0 ? data.steps : [EMPTY_STEP],
    prepTime: data.prepTime,
    cookTime: data.cookTime,
    servings: data.servings ?? undefined,
    tagIds: data.tags,
    cover: getCover(data.media),
});
