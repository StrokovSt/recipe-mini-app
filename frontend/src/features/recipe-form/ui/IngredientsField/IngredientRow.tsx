import clsx from "clsx";
import { Reorder, useDragControls } from "motion/react";
import { type KeyboardEvent, useRef } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";

import GripIcon from "@/shared/assets/icons/icon-grip.svg?react";
import { IconButton } from "@/shared/ui/Buttons";
import { Input } from "@/shared/ui/Input";

import { getArrowMove } from "../../model/reorder";
import type { RecipeFormValues } from "../../model/schema";
import type { ReorderItem } from "../../model/useReorderList";
import AmountInput from "../AmountInput/AmountInput";
import UnitSelect from "../UnitSelect/UnitSelect";

import styles from "./IngredientsField.module.scss";

interface IngredientRowProps {
    groupIndex: number;
    index: number;
    // Сколько строк в группе: дальше последней стрелкой не сдвинуть
    count: number;
    reorder: ReorderItem;
    onRemove: (row: HTMLElement) => void;
    onKeyDown: (event: KeyboardEvent<HTMLLIElement>) => void;
}

// Строка ингредиента: ⋮⋮, название, количество, единица и крестик.
// За ⋮⋮ строку перетаскивают, с клавиатуры двигают стрелками вверх и вниз
const IngredientRow = (props: IngredientRowProps) => {
    const { groupIndex, index, count, reorder, onRemove, onKeyDown } = props;
    const { t } = useTranslation("recipeForm");
    const { control, register, formState: { errors } } = useFormContext<RecipeFormValues>();
    const dragControls = useDragControls();
    const rowRef = useRef<HTMLLIElement>(null);
    const name = `ingredients.${groupIndex}.items.${index}` as const;

    // Строка переезжает в DOM, и браузер снимает с кнопки фокус: возвращаем его
    const handleGripKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
        const to = getArrowMove(event.key, index, count);
        if (to === undefined) return;
        event.preventDefault();

        const grip = event.currentTarget;
        reorder.move(to);
        requestAnimationFrame(() => grip.focus());
    };

    return (
        <Reorder.Item
            as="li"
            ref={rowRef}
            {...reorder.props}
            dragControls={dragControls}
            className={clsx(styles.row, reorder.isLifted && styles.dragging)}
            onKeyDown={onKeyDown}
        >
            <button
                type="button"
                className={styles.grip}
                aria-label={t("ingredients.reorder")}
                aria-keyshortcuts="ArrowUp ArrowDown"
                onPointerDown={(event) => dragControls.start(event)}
                onKeyDown={handleGripKeyDown}
            >
                <GripIcon />
            </button>
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
        </Reorder.Item>
    );
};

export default IngredientRow;
