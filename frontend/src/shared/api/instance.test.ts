import { afterEach, describe, expect, it, vi } from "vitest";

import { api, ApiError } from "./instance";

// Подменяем fetch: отдаёт заданный ответ и запоминает, с чем его вызвали
const mockFetch = (status: number, body = "") => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(body || null, { status }));
    vi.stubGlobal("fetch", fetchMock);
    return fetchMock;
};

afterEach(() => {
    vi.unstubAllGlobals();
});

describe("api", () => {
    it("отдаёт JSON ответа, пустые параметры в адрес не попадают", async () => {
        const fetchMock = mockFetch(200, '[{"id":"r1"}]');

        const data = await api.get("/api/recipes", { search: "борщ", categoryId: undefined });

        expect(data).toEqual([{ id: "r1" }]);
        expect(fetchMock.mock.calls[0][0]).toBe("/api/recipes?search=%D0%B1%D0%BE%D1%80%D1%89");
    });

    it("отправляет тело как JSON", async () => {
        const fetchMock = mockFetch(200, "{}");

        await api.post("/api/tags", { name: "Быстро" });

        const init = fetchMock.mock.calls[0][1];
        expect(init.method).toBe("POST");
        expect(init.body).toBe('{"name":"Быстро"}');
        expect(init.headers["Content-Type"]).toBe("application/json");
    });

    it("пустой ответ (удаление) — undefined", async () => {
        mockFetch(204);

        await expect(api.delete("/api/tags/t1")).resolves.toBeUndefined();
    });

    it("ошибка с кодом от бэкенда — ApiError с code, текстом и кодом ответа", async () => {
        mockFetch(403, '{"code":"LIMIT_REACHED","message":"Лимит рецептов"}');

        const error = await api.post("/api/recipes", {}).catch((e: unknown) => e);

        expect(error).toBeInstanceOf(ApiError);
        expect(error).toMatchObject({ code: "LIMIT_REACHED", message: "Лимит рецептов", status: 403 });
    });

    it("ошибка без кода — ApiError с кодом ответа и текстом как у axios", async () => {
        mockFetch(404, '{"error":"Not found"}');

        const error = await api.get("/api/recipes/x").catch((e: unknown) => e);

        expect(error).toBeInstanceOf(ApiError);
        expect(error).toMatchObject({ code: undefined, message: "Request failed with status code 404", status: 404 });
    });

    it("нет сети — Error «Network Error», как у axios", async () => {
        vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")));

        await expect(api.get("/api/me")).rejects.toThrow("Network Error");
    });
});
