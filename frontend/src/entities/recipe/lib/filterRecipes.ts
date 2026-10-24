import type { Recipe } from "@recipe/common";

import type { GetRecipesProps } from "../types";

// Те же условия, что у сервера (GET /api/recipes): категория, все выбранные теги, название содержит поиск
export function filterRecipes(recipes: Recipe[], filters: GetRecipesProps): Recipe[] {
    const { categoryId, tagIds, search } = filters;

    return recipes.filter(
        (recipe) =>
            (!categoryId || recipe.categoryId === categoryId) &&
            (!tagIds || tagIds.every((id) => recipe.tags.some(({ tagId }) => tagId === id))) &&
            (!search || recipe.title.includes(search)),
    );
}
