import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { RECIPE_KEYS } from "@/entities/recipe";

import { categoryApi } from "./api";

export const CATEGORY_KEYS = {
    all: ["categories"] as const,
    lists: () => [...CATEGORY_KEYS.all, "list"] as const,
};

export function useCategories() {
    return useQuery({
        queryKey: CATEGORY_KEYS.lists(),
        queryFn: categoryApi.getAll,
    });
}

export function useCreateCategory() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (name: string) => categoryApi.create(name),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: CATEGORY_KEYS.lists() });
        },
    });
}

export function useRenameCategory() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, name }: { id: string; name: string }) =>
            categoryApi.rename(id, name),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: CATEGORY_KEYS.lists() });
            queryClient.invalidateQueries({ queryKey: RECIPE_KEYS.lists() });
        },
    });
}

export function useDeleteCategory() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => categoryApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: CATEGORY_KEYS.lists() });
            queryClient.invalidateQueries({ queryKey: RECIPE_KEYS.lists() });
        },
    });
}