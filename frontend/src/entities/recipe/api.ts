import type { CreateRecipeDto, ParsedRecipe, Recipe } from "@recipe/common";

import { api } from "@/shared/api";
import { fileToBase64 } from "@/shared/lib/file";

import type { GetRecipesProps } from "./types";

export const recipeApi = {
    getAll: async (params: GetRecipesProps): Promise<Recipe[]> => {
        const queryParams = {
            categoryId: params.categoryId,
            search: params.search,
            tagIds: params.tagIds?.join(","),
        };

        return api.get<Recipe[]>("/api/recipes", queryParams);
    },

    getById: async (id: string): Promise<Recipe> => {
        return api.get<Recipe>(`/api/recipes/${id}`);
    },

    create: async (recipe: CreateRecipeDto): Promise<Recipe> => {
        return api.post<Recipe>("/api/recipes", recipe);
    },

    update: async (id: string, recipe: Partial<CreateRecipeDto>): Promise<Recipe> => {
        return api.patch<Recipe>(`/api/recipes/${id}`, recipe);
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`/api/recipes/${id}`);
    },

    parse: async (url: string): Promise<ParsedRecipe> => {
        return api.post<ParsedRecipe>("/api/parse", { url });
    },

    parseFromImage: async (file: File): Promise<ParsedRecipe> => {
        const base64 = await fileToBase64(file);
        return api.post<ParsedRecipe>("/api/parse/image", {
            base64,
            mimeType: file.type,
        });
    },

    uploadMedia: async (file: File): Promise<{ url: string; type: "image" | "video" }> => {
        const base64 = await fileToBase64(file);
        return api.post<{ url: string; type: "image" | "video" }>("/api/upload", { base64, mimeType: file.type });
    },
};
