import type { CreateDraftDto, Draft, DraftSummary, UpdateDraftDto } from "@recipe/common";

import { api } from "@/shared/api";

export const draftApi = {
    getAll: async (): Promise<DraftSummary[]> => {
        return api.get<DraftSummary[]>("/api/drafts");
    },

    getById: async <T>(id: string): Promise<Draft<T>> => {
        return api.get<Draft<T>>(`/api/drafts/${id}`);
    },

    create: async <T>(dto: CreateDraftDto<T>): Promise<Draft<T>> => {
        return api.post<Draft<T>>("/api/drafts", dto);
    },

    update: async <T>(id: string, dto: UpdateDraftDto<T>): Promise<DraftSummary> => {
        return api.patch<DraftSummary>(`/api/drafts/${id}`, dto);
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`/api/drafts/${id}`);
    },
};
