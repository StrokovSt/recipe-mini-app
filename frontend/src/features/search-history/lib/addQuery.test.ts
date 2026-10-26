import { describe, expect, it } from "vitest";

import { addQuery, SEARCH_HISTORY_LIMIT } from "./addQuery";
import { matchHistory } from "./matchHistory";

describe("addQuery", () => {
    it("ставит новый запрос первым", () => {
        expect(addQuery(["щи"], "борщ")).toEqual(["борщ", "щи"]);
    });

    it("убирает лишние пробелы и не сохраняет пустой запрос", () => {
        expect(addQuery([], "  суп   грибной ")).toEqual(["суп грибной"]);
        expect(addQuery(["щи"], "   ")).toEqual(["щи"]);
    });

    it("не повторяет тот же запрос, а поднимает его наверх", () => {
        expect(addQuery(["щи", "Борщ"], "борщ")).toEqual(["борщ", "щи"]);
        expect(addQuery(["Свёкла"], "свекла")).toEqual(["свекла"]);
    });

    it("дописанный запрос заменяет свой обрывок", () => {
        expect(addQuery(["бор", "щи"], "борщ")).toEqual(["борщ", "щи"]);
    });

    it("не сохраняет запрос, у которого стёрли буквы", () => {
        expect(addQuery(["борщ", "щи"], "бор")).toEqual(["борщ", "щи"]);
    });

    it("помнит не больше SEARCH_HISTORY_LIMIT запросов", () => {
        const full = Array.from({ length: SEARCH_HISTORY_LIMIT }, (_, index) => `запрос ${index}`);
        const next = addQuery(full, "новый");

        expect(next).toHaveLength(SEARCH_HISTORY_LIMIT);
        expect(next[0]).toBe("новый");
        expect(next).not.toContain(`запрос ${SEARCH_HISTORY_LIMIT - 1}`);
    });
});

describe("matchHistory", () => {
    const history = ["Борщ", "суп грибной", "щи"];

    it("при пустом поле показывает всю историю", () => {
        expect(matchHistory(history, " ")).toEqual(history);
    });

    it("при наборе оставляет запросы с набранным текстом, кроме него самого", () => {
        expect(matchHistory(history, "БОР")).toEqual(["Борщ"]);
        expect(matchHistory(history, "борщ")).toEqual([]);
        expect(matchHistory(history, "гриб")).toEqual(["суп грибной"]);
    });
});
