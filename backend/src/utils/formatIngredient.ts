import type { Ingredient, UnitCode } from "@recipe/common";

// Короткие русские подписи единиц для Telegraph и бота.
// Подписи для приложения на всех языках лежат в словарях фронта (namespace units)
const UNIT_LABELS: Record<UnitCode, string> = {
    g: "г",
    kg: "кг",
    oz: "унц.",
    lb: "фунт.",
    ml: "мл",
    l: "л",
    tsp: "ч. л.",
    tbsp: "ст. л.",
    glass: "стак.",
    cup_us: "чаш.",
    pcs: "шт.",
    clove: "зуб.",
    slice: "лом.",
    bunch: "пуч.",
    sprig: "вет.",
    can: "бан.",
    pack: "уп.",
    pinch: "щеп.",
    handful: "горсть",
    to_taste: "по вкусу",
};

// «Мука — 200 г», «Соль — по вкусу», «Яйца — 2»
export function formatIngredient({ name, amount, unit }: Ingredient) {
    const quantity = [amount !== null ? String(amount).replace(".", ",") : null, unit ? UNIT_LABELS[unit] : null]
        .filter(Boolean)
        .join(" ");

    return quantity ? `${name} — ${quantity}` : name;
}

