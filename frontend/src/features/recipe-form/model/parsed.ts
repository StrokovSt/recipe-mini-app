import type { ParsedRecipe } from "@recipe/common";

import { getCover } from "./cover";
import { EMPTY_FORM_VALUES, type RecipeFormValues } from "./schema";

// Распознанный ИИ рецепт как начальные значения формы. Если ИИ не нашёл ингредиенты или шаги,
// в форме остаётся пустая строка, как при ручном создании
export const parsedToFormValues = (data: ParsedRecipe): RecipeFormValues => ({
    ...EMPTY_FORM_VALUES,
    title: data.title,
    description: data.description,
    categoryId: data.categoryId,
    ingredients: data.ingredients.length > 0 ? data.ingredients : EMPTY_FORM_VALUES.ingredients,
    steps: data.steps.length > 0 ? data.steps : EMPTY_FORM_VALUES.steps,
    prepTime: data.prepTime,
    cookTime: data.cookTime,
    servings: data.servings ?? undefined,
    tagIds: data.tags,
    cover: getCover(data.media),
});
