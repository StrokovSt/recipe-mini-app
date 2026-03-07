import type { CreateRecipeDto, ParsedRecipe, Recipe } from "@recipe/common";

import { api } from "@/shared/api";

export const recipeApi = {
    getAll: async (params?: { category?: string; search?: string }): Promise<Recipe[]> => {
        const { data } = await api.get<Recipe[]>("/api/recipes", { params });
        return data;
    },

    getById: async (id: string): Promise<Recipe> => {
        const { data } = await api.get<Recipe>(`/api/recipes/${id}`);
        return data;
    },

    create: async (recipe: CreateRecipeDto): Promise<Recipe> => {
        const { data } = await api.post<Recipe>("/api/recipes", recipe);
        return data;
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`/api/recipes/${id}`);
    },

    parse: async (url: string): Promise<ParsedRecipe> => {
        const { data } = await api.post<ParsedRecipe>("/api/parse", { url });
        return data;
    },
};