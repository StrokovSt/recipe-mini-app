import type { UpdateUserSettingsDto, User } from "@recipe/common";

import { api } from "@/shared/api";

export const userApi = {
    getMe: async (): Promise<User> => {
        const { data } = await api.get<User>("/api/me");
        return data;
    },

    updateSettings: async (settings: UpdateUserSettingsDto): Promise<User> => {
        const { data } = await api.patch<User>("/api/me", settings);
        return data;
    },
};
