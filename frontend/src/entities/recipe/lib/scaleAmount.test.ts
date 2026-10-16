import { describe, expect, it } from "vitest";

import type { Ingredient } from "@recipe/common";

import { scaleAmount } from "./scaleAmount";

const ingredient = (amount: Ingredient["amount"], unit: Ingredient["unit"]): Ingredient => ({ name: "Тест", amount, unit });

describe("scaleAmount", () => {
    it("не трогает ингредиент, если порции не менялись", () => {
        const item = ingredient(200, "g");
        expect(scaleAmount(item, 1)).toBe(item);
    });

    it("не трогает «по вкусу» и пустое количество", () => {
        expect(scaleAmount(ingredient(null, "to_taste"), 2).amount).toBeNull();
        expect(scaleAmount(ingredient(null, null), 2).amount).toBeNull();
    });

    it("граммы округляет до целых, больше сотни — до 5", () => {
        expect(scaleAmount(ingredient(7, "g"), 0.33).amount).toBe(2);
        expect(scaleAmount(ingredient(70, "g"), 1.53).amount).toBe(105);
    });

    it("килограммы до десятых, от десяти — до целых", () => {
        expect(scaleAmount(ingredient(0.4, "kg"), 2).amount).toBe(0.8);
        expect(scaleAmount(ingredient(4.6, "kg"), 3).amount).toBe(14);
    });

    it("штуки и количество без единицы — до половинки", () => {
        expect(scaleAmount(ingredient(3, "pcs"), 0.5).amount).toBe(1.5);
        expect(scaleAmount(ingredient(2, "pcs"), 0.6).amount).toBe(1);
        expect(scaleAmount(ingredient(3, null), 0.5).amount).toBe(1.5);
    });

    it("не даёт ингредиенту пропасть при уменьшении", () => {
        expect(scaleAmount(ingredient(3, "g"), 0.1).amount).toBe(1);
        expect(scaleAmount(ingredient(1, "pcs"), 0.25).amount).toBe(0.5);
    });

    it("не переводит единицы", () => {
        expect(scaleAmount(ingredient(500, "g"), 4)).toEqual(ingredient(2000, "g"));
    });
});
