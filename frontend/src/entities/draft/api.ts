import type { CreateDraftDto, Draft, DraftSummary, UpdateDraftDto } from "@recipe/common";

import { api } from "@/shared/api";

export const draftApi = {
    getAll: async (): Promise<DraftSummary[]> => {
        const { data } = await api.get<DraftSummary[]>("/api/drafts");
        return data;
    },

    getById: async <T>(id: string): Promise<Draft<T>> => {
        const { data } = await api.get<Draft<T>>(`/api/drafts/${id}`);
        return data;
    },

    create: async <T>(dto: CreateDraftDto<T>): Promise<Draft<T>> => {
        const { data } = await api.post<Draft<T>>("/api/drafts", dto);
        return data;
    },

    update: async <T>(id: string, dto: UpdateDraftDto<T>): Promise<DraftSummary> => {
        const { data } = await api.patch<DraftSummary>(`/api/drafts/${id}`, dto);
        return data;
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`/api/drafts/${id}`);
    },
};
