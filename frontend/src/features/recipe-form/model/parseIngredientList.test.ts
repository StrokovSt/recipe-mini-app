import { describe, expect, it } from "vitest";

import en from "@/shared/config/i18n/locales/en/units.json";
import ru from "@/shared/config/i18n/locales/ru/units.json";

import { parseIngredientList, type UnitLabels } from "./parseIngredientList";

const parse = (text: string, labels: UnitLabels = ru.label) => parseIngredientList(text, labels);
const one = (line: string, labels?: UnitLabels) => parse(line, labels)[0];

describe("parseIngredientList", () => {
    it("каждая непустая строка — ингредиент", () => {
        expect(parse("Мука — 200 г\n\nВода — 2,5 л\n")).toEqual([
            { name: "Мука", amount: 200, unit: "g" },
            { name: "Вода", amount: 2.5, unit: "l" },
        ]);
    });

    it("количество после названия через тире, двоеточие, запятую или скобки", () => {
        expect(one("Свёкла: 2 шт.")).toEqual({ name: "Свёкла", amount: 2, unit: "pcs" });
        expect(one("Сахар, 100г")).toEqual({ name: "Сахар", amount: 100, unit: "g" });
        expect(one("Лук (1 шт.)")).toEqual({ name: "Лук", amount: 1, unit: "pcs" });
        expect(one("Томатная паста 2 ст. л.")).toEqual({ name: "Томатная паста", amount: 2, unit: "tbsp" });
    });

    it("количество перед названием", () => {
        expect(one("200 г муки")).toEqual({ name: "муки", amount: 200, unit: "g" });
        expect(one("2 ст.л. сахара")).toEqual({ name: "сахара", amount: 2, unit: "tbsp" });
        expect(one("3 яйца")).toEqual({ name: "яйца", amount: 3, unit: null });
    });

    it("убирает маркеры списка и номера пунктов", () => {
        expect(parse("- Соль\n• Перец\n1. Мука — 1 кг\n2) Сода")).toEqual([
            { name: "Соль", amount: null, unit: null },
            { name: "Перец", amount: null, unit: null },
            { name: "Мука", amount: 1, unit: "kg" },
            { name: "Сода", amount: null, unit: null },
        ]);
    });

    it("дроби и диапазоны: у диапазона нижняя граница", () => {
        expect(one("Сода — 1/2 ч. л.")).toEqual({ name: "Сода", amount: 0.5, unit: "tsp" });
        expect(one("1/2 ч. л. соды")).toEqual({ name: "соды", amount: 0.5, unit: "tsp" });
        expect(one("½ стакана молока")).toEqual({ name: "молока", amount: 0.5, unit: "glass" });
        expect(one("Молоко 1½ стакана")).toEqual({ name: "Молоко", amount: 1.5, unit: "glass" });
        expect(one("Чеснок 2-3 зубчика")).toEqual({ name: "Чеснок", amount: 2, unit: "clove" });
        expect(one("1/3 стакана")?.amount).toBeUndefined();
    });

    it("формы слова и сокращения единиц", () => {
        expect(one("Укроп — 3 веточки")?.unit).toBe("sprig");
        expect(one("Фасоль — 2 банки")?.unit).toBe("can");
        expect(one("Масло — 2 столовые ложки")?.unit).toBe("tbsp");
        expect(one("Рис — 300 гр")?.unit).toBe("g");
    });

    it("«по вкусу» без количества", () => {
        expect(one("Соль по вкусу")).toEqual({ name: "Соль", amount: null, unit: "to_taste" });
        expect(one("Соль, перец — по вкусу")).toEqual({ name: "Соль, перец", amount: null, unit: "to_taste" });
    });

    it("число, после которого не единица, остаётся в названии", () => {
        expect(one("Сливки 33%")).toEqual({ name: "Сливки 33%", amount: null, unit: null });
        expect(one("Молоко 3,2% — 200 мл")).toEqual({ name: "Молоко 3,2%", amount: 200, unit: "ml" });
    });

    it("единица не путается с началом слова", () => {
        expect(one("2 лука")).toEqual({ name: "лука", amount: 2, unit: null });
        expect(one("2 large eggs", en.label)).toEqual({ name: "large eggs", amount: 2, unit: null });
    });

    it("английские рецепты", () => {
        expect(one("2 cups of flour", en.label)).toEqual({ name: "flour", amount: 2, unit: "cup_us" });
        expect(one("1 1/2 tbsp olive oil", en.label)).toEqual({ name: "olive oil", amount: 1.5, unit: "tbsp" });
        expect(one("Salt to taste", en.label)).toEqual({ name: "Salt", amount: null, unit: "to_taste" });
    });

    it("пропускает заголовки групп и строки без названия", () => {
        expect(parse("Для соуса:\n200 г\nСметана — 100 г")).toEqual([{ name: "Сметана", amount: 100, unit: "g" }]);
    });

    it("ноль — без количества", () => {
        expect(one("Мука 0 г")).toEqual({ name: "Мука", amount: null, unit: "g" });
    });
});
