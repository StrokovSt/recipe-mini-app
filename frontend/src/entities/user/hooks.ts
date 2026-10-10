import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { userApi } from "./api";

export const USER_KEYS = {
    me: ["me"] as const,
};

// fresh — перезапросить при открытии экрана: число рецептов меняется при добавлении и удалении
export function useMe({ fresh = false }: { fresh?: boolean } = {}) {
    return useQuery({
        queryKey: USER_KEYS.me,
        queryFn: userApi.getMe,
        ...(fresh && { staleTime: 0 }),
    });
}

export function useUpdateSettings() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: userApi.updateSettings,
        onSuccess: (user) => {
            queryClient.setQueryData(USER_KEYS.me, user);
        },
    });
}
