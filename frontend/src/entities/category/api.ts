import type { Category } from "@recipe/common";

import { api } from "@/shared/api";

interface UpdateCategoryDto {
    name?: string;
    iconName?: string;
}

export const categoryApi = {
    getAll: async (): Promise<Category[]> => {
        return api.get<Category[]>("/api/categories");
    },

    create: async (name: string, iconName: string,): Promise<Category> => {
        return api.post<Category>("/api/categories", {
            name,
            iconName,
        });
    },

    update: async (id: string, data: UpdateCategoryDto): Promise<Category> => {
        return api.patch<Category>(
            `/api/categories/${id}`,
            data,
        );
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`/api/categories/${id}`);
    },
};