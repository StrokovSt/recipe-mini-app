import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { tagApi } from "./api";

export const TAG_KEYS = {
    all: ["tags"] as const,
    lists: () => [...TAG_KEYS.all, "list"] as const,
};

export function useTags() {
    return useQuery({
        queryKey: TAG_KEYS.lists(),
        queryFn: tagApi.getAll,
    });
}

export function useCreateTag() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (name: string) => tagApi.create(name),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: TAG_KEYS.lists() });
        },
    });
}

export function useRenameTag() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, name }: { id: string; name: string }) => tagApi.rename(id, name),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: TAG_KEYS.lists() });
        },
    });
}

export function useDeleteTag() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => tagApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: TAG_KEYS.lists() });
        },
    });
}