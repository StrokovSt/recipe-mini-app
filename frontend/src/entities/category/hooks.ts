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

    return useMutation({mutationFn: ({name, iconName}: {
            name: string;
            iconName: string;
        }) => categoryApi.create(name, iconName),

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: CATEGORY_KEYS.lists(),
            });
        },
    });
}

export function useUpdateCategory() {
    const queryClient = useQueryClient();

    return useMutation({mutationFn: ({id,...data}: {
            id: string;
            name?: string;
            iconName?: string;
        }) => categoryApi.update(id, data),

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: CATEGORY_KEYS.lists(),
            });

            queryClient.invalidateQueries({
                queryKey: RECIPE_KEYS.lists(),
            });
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