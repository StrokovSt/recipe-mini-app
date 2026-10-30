import { describe, expect, it } from "vitest";

import { BRUSH_SHAPES, getBrushShape } from "./getBrushShape";

describe("getBrushShape", () => {
    it("формы идут по очереди с первой", () => {
        expect([0, 1, 2].map(getBrushShape)).toEqual([1, 2, 3]);
    });

    it("после последней формы снова первая", () => {
        expect(getBrushShape(BRUSH_SHAPES - 1)).toBe(BRUSH_SHAPES);
        expect(getBrushShape(BRUSH_SHAPES)).toBe(1);
    });

    it("соседние карточки получают разные формы", () => {
        Array.from({ length: 20 }, (_, index) => index).forEach((index) => {
            expect(getBrushShape(index)).not.toBe(getBrushShape(index + 1));
        });
    });
});
