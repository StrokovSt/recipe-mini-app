import { describe, expect, it } from "vitest";

import type { Recipe } from "@recipe/common";

import { filterRecipes } from "./filterRecipes";

// Для фильтра нужны только id, название, категория, теги и названия ингредиентов
const recipe = (id: string, categoryId: string, tagIds: string[], title = id, ingredients: string[] = []) =>
    ({
        id,
        title,
        categoryId,
        tags: tagIds.map((tagId) => ({ tagId })),
        ingredients: [{ title: null, items: ingredients.map((name) => ({ name, amount: null, unit: null })) }],
    }) as unknown as Recipe;

const recipes = [recipe("a", "soup", ["fast"]), recipe("b", "soup", ["fast", "vegan"]), recipe("c", "cake", ["vegan"])];
const ids = (list: Recipe[]) => list.map(({ id }) => id);

describe("filterRecipes", () => {
    it("без фильтров возвращает все рецепты", () => {
        expect(ids(filterRecipes(recipes, {}))).toEqual(["a", "b", "c"]);
    });

    it("оставляет рецепты выбранной категории", () => {
        expect(ids(filterRecipes(recipes, { categoryId: "soup" }))).toEqual(["a", "b"]);
    });

    it("оставляет рецепты, где есть все выбранные теги", () => {
        expect(ids(filterRecipes(recipes, { tagIds: ["fast", "vegan"] }))).toEqual(["b"]);
    });

    it("ищет по названию", () => {
        const list = [recipe("a", "soup", [], "Борщ"), recipe("b", "soup", [], "Щи")];
        expect(ids(filterRecipes(list, { search: "орщ" }))).toEqual(["a"]);
    });

    it("ищет без учёта регистра", () => {
        const list = [recipe("a", "soup", [], "Борщ"), recipe("b", "soup", [], "Щи")];
        expect(ids(filterRecipes(list, { search: "БОРЩ" }))).toEqual(["a"]);
    });

    it("считает ё и е одной буквой", () => {
        const list = [recipe("a", "salad", [], "Свёкла с чесноком"), recipe("b", "salad", [], "Винегрет")];
        expect(ids(filterRecipes(list, { search: "свекла" }))).toEqual(["a"]);
        expect(ids(filterRecipes(list, { search: "чеснок свёкла" }))).toEqual(["a"]);
    });

    it("находит по ингредиенту и ставит совпадения в названии выше", () => {
        const list = [
            recipe("a", "soup", [], "Суп с лапшой", ["Курица", "Лапша"]),
            recipe("b", "main", [], "Курица в духовке", ["Курица"]),
            recipe("c", "cake", [], "Шарлотка", ["Яблоки"]),
        ];
        expect(ids(filterRecipes(list, { search: "курица" }))).toEqual(["b", "a"]);
    });

    it("ищет каждое слово, в любом порядке", () => {
        const list = [recipe("a", "soup", [], "Грибной суп", ["Шампиньоны"]), recipe("b", "soup", [], "Суп с лапшой")];
        expect(ids(filterRecipes(list, { search: "суп  грибной" }))).toEqual(["a"]);
        expect(ids(filterRecipes(list, { search: "суп шампиньоны" }))).toEqual(["a"]);
    });
});
