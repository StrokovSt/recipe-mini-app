import { useTranslation } from "react-i18next";

import type { Ingredient } from "@recipe/common";

// Количество ингредиента на текущем языке: «200 г», «2 зубчика», «по вкусу».
// Без количества и единицы — пустая строка
export const useFormatQuantity = () => {
    const { t, i18n } = useTranslation("units");

    return ({ amount, unit }: Pick<Ingredient, "amount" | "unit">) => {
        if (unit === null) return amount === null ? "" : new Intl.NumberFormat(i18n.language).format(amount);
        if (amount === null) return t(`label.${unit}`);
        return t(`quantity.${unit}`, { count: amount });
    };
};
