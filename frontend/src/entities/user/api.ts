import type { AuthProvider, UpdateUserSettingsDto, User } from "@recipe/common";

import { api } from "@/shared/api";

export const userApi = {
    getMe: async (): Promise<User> => {
        return api.get<User>("/api/me");
    },

    // Отвязать способ входа: ответ — профиль с оставшимися способами
    unlinkProvider: async (provider: AuthProvider): Promise<User> => {
        return api.delete<User>(`/api/me/providers/${provider}`);
    },

    updateSettings: async (settings: UpdateUserSettingsDto): Promise<User> => {
        return api.patch<User>("/api/me", settings);
    },
};
