import type { Tag } from "@recipe/common";

import { api } from "@/shared/api";

export const tagApi = {
    getAll: async (): Promise<Tag[]> => {
        const { data } = await api.get<Tag[]>("/api/tags");
        return data;
    },

    create: async (name: string): Promise<Tag> => {
        const { data } = await api.post<Tag>("/api/tags", { name });
        return data;
    },

    rename: async (id: string, name: string): Promise<Tag> => {
        const { data } = await api.patch<Tag>(`/api/tags/${id}`, { name });
        return data;
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`/api/tags/${id}`);
    },
};