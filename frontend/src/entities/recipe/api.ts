import type { CreateRecipeDto, ParsedRecipe, Recipe } from "@recipe/common";

import { api } from "@/shared/api";
import { fileToBase64 } from "@/shared/lib/utils";

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

    update: async (id: string, recipe: Partial<CreateRecipeDto>): Promise<Recipe> => {
        const { data } = await api.patch<Recipe>(`/api/recipes/${id}`, recipe);
        return data;
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`/api/recipes/${id}`);
    },

    parse: async (url: string): Promise<ParsedRecipe> => {
        const { data } = await api.post<ParsedRecipe>("/api/parse", { url });
        return data;
    },

    parseFromImage: async (file: File): Promise<ParsedRecipe> => {
        const base64 = await fileToBase64(file);
        const { data } = await api.post<ParsedRecipe>("/api/parse/image", {
            base64,
            mimeType: file.type,
        });
        return data;
    },

    uploadMedia: async (file: File): Promise<{ url: string; type: "image" | "video" }> => {
        const base64 = await fileToBase64(file);
        const { data } = await api.post("/api/upload", { base64, mimeType: file.type });
        return data;
    },
};
