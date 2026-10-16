import { describe, expect, it } from "vitest";

import { getRecipeSource } from "./getRecipeSource";

describe("getRecipeSource", () => {
    it("узнаёт площадку по домену ссылки", () => {
        expect(getRecipeSource({ source: "other", sourceUrl: "https://www.pinterest.ru/pin/123" })?.label).toBe("Pinterest");
        expect(getRecipeSource({ source: "other", sourceUrl: "https://pin.it/abc" })?.label).toBe("Pinterest");
        expect(getRecipeSource({ source: "other", sourceUrl: "https://t.me/channel/1" })?.label).toBe("Telegram");
        expect(getRecipeSource({ source: "other", sourceUrl: "https://m.youtube.com/watch?v=1" })?.label).toBe("YouTube");
        expect(getRecipeSource({ source: "other", sourceUrl: "https://youtu.be/1" })?.label).toBe("YouTube");
    });

    it("для обычного сайта показывает домен без www", () => {
        const url = "https://www.russianfood.com/recipes/recipe.php?rid=1";
        expect(getRecipeSource({ source: "other", sourceUrl: url })).toMatchObject({ label: "russianfood.com", url });
    });

    it("без ссылки узнаёт площадку по полю source", () => {
        expect(getRecipeSource({ source: "telegram", sourceUrl: "" })).toMatchObject({ label: "Telegram", url: null });
    });

    it("битую ссылку не отдаёт", () => {
        expect(getRecipeSource({ source: "pinterest", sourceUrl: "не ссылка" })).toMatchObject({ label: "Pinterest", url: null });
    });

    it("без ссылки и площадки возвращает null", () => {
        expect(getRecipeSource({ source: "other", sourceUrl: "" })).toBeNull();
    });
});
