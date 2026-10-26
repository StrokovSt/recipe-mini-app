import { describe, expect, it } from "vitest";

import { findMove, getArrowMove } from "./reorder";

const list = (ids: string) => ids.split("").map((id) => ({ id }));

// Сдвигает элемент, как move из useFieldArray, и возвращает новый порядок строкой
const reorder = (prev: string, next: string) => {
    const move = findMove(list(prev), list(next));
    if (!move) return prev;

    const items = prev.split("");
    const [item] = items.splice(move[0], 1);
    items.splice(move[1], 0, item);
    return items.join("");
};

describe("findMove", () => {
    it("строка сдвинута вниз", () => {
        expect(findMove(list("abcd"), list("bcad"))).toEqual([0, 2]);
        expect(reorder("abcd", "bcad")).toBe("bcad");
    });

    it("строка сдвинута вверх", () => {
        expect(findMove(list("abcd"), list("adbc"))).toEqual([3, 1]);
        expect(reorder("abcd", "adbc")).toBe("adbc");
    });

    it("соседние строки поменялись местами", () => {
        expect(reorder("abc", "bac")).toBe("bac");
        expect(reorder("abc", "acb")).toBe("acb");
    });

    it("порядок не изменился", () => {
        expect(findMove(list("abc"), list("abc"))).toBeNull();
    });
});

describe("getArrowMove", () => {
    it("стрелки двигают на одно место", () => {
        expect(getArrowMove("ArrowUp", 2, 4)).toBe(1);
        expect(getArrowMove("ArrowDown", 2, 4)).toBe(3);
    });

    it("за края списка не двигает", () => {
        expect(getArrowMove("ArrowUp", 0, 4)).toBeUndefined();
        expect(getArrowMove("ArrowDown", 3, 4)).toBeUndefined();
    });

    it("другие клавиши не двигают", () => {
        expect(getArrowMove("Enter", 1, 4)).toBeUndefined();
    });
});
