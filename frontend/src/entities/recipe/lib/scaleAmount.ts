import type { Ingredient, UnitCode } from "@recipe/common";

// Граммы и миллилитры: до целых, больше сотни — до 5
const SMALL_METRIC: UnitCode[] = ["g", "ml"];

// Килограммы, литры, унции, фунты: до десятых, от десяти — до целых
const LARGE_METRIC: UnitCode[] = ["kg", "l", "oz", "lb"];

const HALF = 0.5;
const ROUND_TO_FIVE_FROM = 100;
const ROUND_TO_INTEGER_FROM = 10;

// Округляет до шага, но не ниже самого шага: ингредиент не должен пропасть
const roundTo = (value: number, step: number) =>
    Math.max(step, Number((Math.round(value / step) * step).toFixed(2)));

const roundAmount = (value: number, unit: UnitCode | null) => {
    if (unit && SMALL_METRIC.includes(unit)) return roundTo(value, value > ROUND_TO_FIVE_FROM ? 5 : 1);
    if (unit && LARGE_METRIC.includes(unit)) return roundTo(value, value >= ROUND_TO_INTEGER_FROM ? 1 : 0.1);

    // Штуки, ложки, стаканы, щепотки и количество без единицы — до половинки
    return roundTo(value, HALF);
};

// Пересчитывает количество ингредиента на другое число порций.
// Единицы не переводим (1000 г не станет 1 кг), «по вкусу» и пустое количество не трогаем
export const scaleAmount = (ingredient: Ingredient, ratio: number): Ingredient => {
    if (ingredient.amount === null || ratio === 1) return ingredient;

    return { ...ingredient, amount: roundAmount(ingredient.amount * ratio, ingredient.unit) };
};
