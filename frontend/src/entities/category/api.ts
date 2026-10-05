import type { Category } from "@recipe/common";

import { api } from "@/shared/api";

interface UpdateCategoryDto {
    name?: string;
    iconName?: string;
}

export const categoryApi = {
    getAll: async (): Promise<Category[]> => {
        const { data } = await api.get<Category[]>("/api/categories");
        return data;
    },

    create: async (name: string, iconName: string,): Promise<Category> => {
        const { data } = await api.post<Category>("/api/categories", {
            name,
            iconName,
        });

        return data;
    },

    update: async (id: string, data: UpdateCategoryDto): Promise<Category> => {
        const { data: category } = await api.patch<Category>(
            `/api/categories/${id}`,
            data,
        );

        return category;
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`/api/categories/${id}`);
    },
};