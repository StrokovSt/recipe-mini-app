import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { draftApi } from "./api";

export const DRAFT_KEYS = {
    all: ["drafts"] as const,
    lists: () => [...DRAFT_KEYS.all, "list"] as const,
    detail: (id: string) => [...DRAFT_KEYS.all, "detail", id] as const,
};

export function useDrafts() {
    return useQuery({
        queryKey: DRAFT_KEYS.lists(),
        queryFn: draftApi.getAll,
    });
}

// Черновик меняется автосохранением, поэтому в кэше его не держим: при открытии всегда свежий
export function useDraft<T>(id: string | undefined) {
    return useQuery({
        queryKey: DRAFT_KEYS.detail(id ?? ""),
        queryFn: () => draftApi.getById<T>(id!),
        enabled: !!id,
        gcTime: 0,
        retry: false,
    });
}

export function useDeleteDraft() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => draftApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: DRAFT_KEYS.lists() });
        },
    });
}
