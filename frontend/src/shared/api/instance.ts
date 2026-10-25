import type { AppError } from "@recipe/common";

import { getTelegram } from "@/shared/lib/telegram";

// Ответ с ошибкой: код ответа всегда, code и текст — если бэкенд их прислал
export class ApiError extends Error {
    code?: string;
    status: number;

    constructor(status: number, appError?: AppError) {
        // Без текста от бэкенда — тот же текст, что был у axios
        super(appError?.message ?? `Request failed with status code ${status}`);
        this.code = appError?.code;
        this.status = status;
    }
}

type QueryParams = Record<string, string | undefined>;

const API_URL = (import.meta.env.VITE_API_URL ?? "").replace(/\/+$/, "");

// Параметры без значения в адрес не попадают
const buildUrl = (path: string, params: QueryParams = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) query.append(key, value);
    });

    const search = query.toString();
    return API_URL + path + (search ? `?${search}` : "");
};

// Кто делает запрос: в Телеграме бэкенд проверяет его по initData
const getAuthHeaders = (): Record<string, string> => {
    const telegram = getTelegram();
    const headers: Record<string, string> = {
        "x-user-id": telegram?.initDataUnsafe?.user?.id?.toString() ?? "dev-user",
    };
    if (telegram?.initData) headers["x-init-data"] = telegram.initData;

    return headers;
};

const isAppError = (data: unknown): data is AppError =>
    typeof data === "object" && data !== null && "code" in data;

// Тело ответа: JSON, пустой ответ — undefined, не JSON — как есть
const parseBody = (text: string): unknown => {
    if (!text) return undefined;
    try {
        return JSON.parse(text);
    } catch {
        return text;
    }
};

async function request<T>(method: string, path: string, body?: unknown, params?: QueryParams): Promise<T> {
    const headers = getAuthHeaders();
    if (body !== undefined) headers["Content-Type"] = "application/json";

    let response: Response;
    try {
        response = await fetch(buildUrl(path, params), {
            method,
            headers,
            body: body === undefined ? undefined : JSON.stringify(body),
        });
    } catch {
        // Нет сети или бэкенд недоступен. Текст как у axios: в разных браузерах fetch пишет по-разному
        throw new Error("Network Error");
    }

    const data = parseBody(await response.text());
    if (!response.ok) throw new ApiError(response.status, isAppError(data) ? data : undefined);

    return data as T;
}

export const api = {
    get: <T>(path: string, params?: QueryParams) => request<T>("GET", path, undefined, params),
    post: <T>(path: string, body: unknown) => request<T>("POST", path, body),
    patch: <T>(path: string, body: unknown) => request<T>("PATCH", path, body),
    delete: (path: string) => request<void>("DELETE", path),
};
