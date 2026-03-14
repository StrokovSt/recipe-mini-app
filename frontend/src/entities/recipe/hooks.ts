import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { CreateRecipeDto } from "@recipe/common";

import { recipeApi } from "./api";

export const RECIPE_KEYS = {
    all: ["recipes"] as const,
    lists: () => [...RECIPE_KEYS.all, "list"] as const,
    list: (filters: { category?: string; search?: string }) =>
        [...RECIPE_KEYS.lists(), filters] as const,
    detail: (id: string) => [...RECIPE_KEYS.all, "detail", id] as const,
    categories: () => [...RECIPE_KEYS.all, "categories"] as const,
};

export function useRecipes(filters?: { category?: string; search?: string }) {
    return useQuery({
        queryKey: RECIPE_KEYS.list(filters ?? {}),
        queryFn: () => recipeApi.getAll(filters),
    });
}

export function useRecipe(id: string) {
    return useQuery({
        queryKey: RECIPE_KEYS.detail(id),
        queryFn: () => recipeApi.getById(id),
        enabled: !!id,
    });
}

export function useCreateRecipe() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (recipe: CreateRecipeDto) => recipeApi.create(recipe),
        onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: RECIPE_KEYS.lists() });
        queryClient.invalidateQueries({ queryKey: RECIPE_KEYS.categories() });
        },
    });
}

export function useUpdateRecipe() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, ...data }: Partial<CreateRecipeDto> & { id: string }) =>
            recipeApi.update(id, data),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: RECIPE_KEYS.lists() });
            queryClient.invalidateQueries({ queryKey: RECIPE_KEYS.detail(id) });
        },
    });
}

export function useDeleteRecipe() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => recipeApi.delete(id),
        onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: RECIPE_KEYS.lists() });
        },
    });
}

export function useParseRecipe() {
    return useMutation({
        mutationFn: (url: string) => recipeApi.parse(url),
    });
}

export function useParseRecipeFromImage() {
    return useMutation({
        mutationFn: (file: File) => recipeApi.parseFromImage(file),
    });
}

export function useUploadMedia() {
    return useMutation({
        mutationFn: (file: File) => recipeApi.uploadMedia(file),
    });
}