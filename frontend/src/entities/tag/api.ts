import type { Tag } from "@recipe/common";

import { api } from "@/shared/api";

export const tagApi = {
    getAll: async (): Promise<Tag[]> => {
        return api.get<Tag[]>("/api/tags");
    },

    create: async (name: string): Promise<Tag> => {
        return api.post<Tag>("/api/tags", { name });
    },

    rename: async (id: string, name: string): Promise<Tag> => {
        return api.patch<Tag>(`/api/tags/${id}`, { name });
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`/api/tags/${id}`);
    },
};