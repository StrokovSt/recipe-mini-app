import type { UpdateUserSettingsDto, User } from "@recipe/common";

import { api } from "@/shared/api";

export const userApi = {
    getMe: async (): Promise<User> => {
        return api.get<User>("/api/me");
    },

    updateSettings: async (settings: UpdateUserSettingsDto): Promise<User> => {
        return api.patch<User>("/api/me", settings);
    },
};
