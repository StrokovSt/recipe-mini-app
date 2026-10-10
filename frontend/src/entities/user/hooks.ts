import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { userApi } from "./api";

export const USER_KEYS = {
    me: ["me"] as const,
};

export function useMe() {
    return useQuery({
        queryKey: USER_KEYS.me,
        queryFn: userApi.getMe,
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
