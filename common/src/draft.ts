import type { RecipeSource } from "./recipe";

// Сколько черновиков может быть у пользователя одновременно
export const DRAFT_LIMIT = 5;

// Откуда начат черновик: распознан ИИ или заполняется вручную
export type DraftOrigin = "ai" | "manual";

// Элемент списка GET /api/drafts, без данных формы
export interface DraftSummary {
    id: string;
    title: string;
    origin: DraftOrigin;
    source: RecipeSource;
    createdAt: string;
    updatedAt: string;
}

// GET /api/drafts/:id. data — значения формы, бэкенд хранит их как есть
export interface Draft<T = unknown> extends DraftSummary {
    data: T;
}

// POST /api/drafts
export interface CreateDraftDto<T = unknown> {
    title: string;
    origin: DraftOrigin;
    source?: RecipeSource;
    data: T;
}

// PATCH /api/drafts/:id
export type UpdateDraftDto<T = unknown> = Partial<Pick<CreateDraftDto<T>, "title" | "data">>;
