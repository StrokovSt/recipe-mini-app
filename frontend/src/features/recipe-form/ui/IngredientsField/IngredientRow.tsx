import { type KeyboardEvent, useRef } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { IconButton } from "@/shared/ui/Buttons";
import { Input } from "@/shared/ui/Input";

import type { RecipeFormValues } from "../../model/schema";
import AmountInput from "../AmountInput/AmountInput";
import UnitSelect from "../UnitSelect/UnitSelect";

import styles from "./IngredientsField.module.scss";

interface IngredientRowProps {
    groupIndex: number;
    index: number;
    onRemove: (row: HTMLElement) => void;
    onKeyDown: (event: KeyboardEvent<HTMLLIElement>) => void;
}

// Строка ингредиента: название, количество, единица и крестик
const IngredientRow = (props: IngredientRowProps) => {
    const { groupIndex, index, onRemove, onKeyDown } = props;
    const { t } = useTranslation("recipeForm");
    const { control, register, formState: { errors } } = useFormContext<RecipeFormValues>();
    const rowRef = useRef<HTMLLIElement>(null);
    const name = `ingredients.${groupIndex}.items.${index}` as const;

    return (
        <li ref={rowRef} className={styles.row} onKeyDown={onKeyDown}>
            <Input
                variant="line"
                hideLabel
                register={register(`${name}.name`)}
                label={t("ingredients.name")}
                error={errors.ingredients?.[groupIndex]?.items?.[index]?.name?.message}
                className={styles.name}
            />
            <Controller
                control={control}
                name={`${name}.amount`}
                render={({ field: amount, fieldState }) => (
                    <AmountInput
                        value={amount.value}
                        onChange={amount.onChange}
                        onBlur={amount.onBlur}
                        label={t("ingredients.amount")}
                        className={styles.amount}
                        error={fieldState.error?.message}
                    />
                )}
            />
            <Controller
                control={control}
                name={`${name}.unit`}
                render={({ field: unit }) => (
                    <UnitSelect value={unit.value} onChange={unit.onChange} className={styles.unit} />
                )}
            />
            <IconButton
                icon="close"
                variant="empty"
                type="button"
                className={styles.remove}
                aria-label={t("ingredients.remove")}
                onClick={() => rowRef.current && onRemove(rowRef.current)}
            />
        </li>
    );
};

export default IngredientRow;
