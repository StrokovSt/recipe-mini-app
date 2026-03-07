import type { Category } from "@recipe/common";

import { api } from "@/shared/api";

export const categoryApi = {
    getAll: async (): Promise<Category[]> => {
        const { data } = await api.get<Category[]>("/api/categories");
        return data;
    },

    create: async (name: string): Promise<Category> => {
        const { data } = await api.post<Category>("/api/categories", { name });
        return data;
    },

    rename: async (id: string, name: string): Promise<void> => {
        await api.patch(`/api/categories/${id}`, { name });
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`/api/categories/${id}`);
    },
};