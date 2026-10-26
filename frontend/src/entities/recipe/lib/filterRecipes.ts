import { type Recipe, searchRecipes } from "@recipe/common";

import type { GetRecipesProps } from "../types";

// Те же условия, что у сервера (GET /api/recipes): категория, все выбранные теги, поиск по названию и ингредиентам
export function filterRecipes(recipes: Recipe[], filters: GetRecipesProps): Recipe[] {
    const { categoryId, tagIds, search } = filters;

    const filtered = recipes.filter(
        (recipe) =>
            (!categoryId || recipe.categoryId === categoryId) &&
            (!tagIds || tagIds.every((id) => recipe.tags.some(({ tagId }) => tagId === id))),
    );

    return searchRecipes(filtered, search);
}
