
import { api } from "@/shared/api";

import type { CreateRecipeDto, ParsedRecipe, Recipe } from "./types";

export const recipeApi = {
    getAll: async (params?: { category?: string; search?: string }): Promise<Recipe[]> => {
        const { data } = await api.get("/api/recipes", { params });
        return data;
    },

    getById: async (id: string): Promise<Recipe> => {
        const { data } = await api.get(`/api/recipes/${id}`);
        return data;
    },

    getCategories: async (): Promise<string[]> => {
        const { data } = await api.get("/api/recipes/categories");
        return data;
    },

    create: async (recipe: CreateRecipeDto): Promise<Recipe> => {
        const { data } = await api.post("/api/recipes", recipe);
        return data;
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`/api/recipes/${id}`);
    },

    parse: async (url: string): Promise<ParsedRecipe> => {
        const { data } = await api.post("/api/parse", { url });
        return data;
    },
};