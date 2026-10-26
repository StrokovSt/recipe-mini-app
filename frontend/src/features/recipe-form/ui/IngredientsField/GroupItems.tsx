import { Reorder } from "motion/react";
import { type KeyboardEvent, useRef, useState } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";

import type { Ingredient } from "@recipe/common";

import FormIcon from "@/shared/assets/icons/icon-form.svg?react";
import { collapseAndRemove, insertAndExpand } from "@/shared/lib/animations";
import { AddButton } from "@/shared/ui/Buttons";

import { EMPTY_INGREDIENT, isEmptyIngredient, type RecipeFormValues } from "../../model/schema";
import { useReorderList } from "../../model/useReorderList";
import { useUndoToast } from "../../model/useUndoToast";
import PasteSheet from "../PasteSheet/PasteSheet";
import IngredientRow from "./IngredientRow";

import styles from "./IngredientsField.module.scss";

interface GroupItemsProps {
    groupIndex: number;
}

// Строки ингредиентов группы с «+ Ингредиент» и «Вставить списком» под ними
const GroupItems = ({ groupIndex }: GroupItemsProps) => {
    const { t } = useTranslation("recipeForm");
    const { control, setFocus, getValues } = useFormContext<RecipeFormValues>();
    const { fields, append, insert, update, move, remove, replace } = useFieldArray({
        control,
        name: `ingredients.${groupIndex}.items`,
    });
    const showUndo = useUndoToast();
    const [isPasteOpen, setIsPasteOpen] = useState(false);
    const listRef = useRef<HTMLUListElement>(null);
    const { groupProps, getItem } = useReorderList(fields, move, listRef);

    // Строка плавно схлопывается и удаляется, непустую можно вернуть из уведомления.
    // Единственная строка группы не пропадает, а очищается
    const removeRow = (row: HTMLElement) => {
        const removeFromForm = () => {
            // Пока строка схлопывалась, выше могли удалить другую: её место берём по порядку в списке
            const index = Array.from(listRef.current?.children ?? []).indexOf(row);
            if (index === -1) return;

            const item = getValues(`ingredients.${groupIndex}.items.${index}`);
            const isLast = getValues(`ingredients.${groupIndex}.items`).length === 1;

            if (isLast) update(index, EMPTY_INGREDIENT);
            else remove(index);
            if (isEmptyIngredient(item)) return;

            showUndo(t("ingredients.removed"), () => {
                if (isLast) update(index, item);
                else insertAndExpand(() => insert(index, item), () => listRef.current?.children[index]);
            });
        };

        if (fields.length === 1) removeFromForm();
        else void collapseAndRemove(row, removeFromForm);
    };

    // Вставленный список встаёт в конец группы, пустые строки группы он заменяет
    const addPasted = (items: Ingredient[]) => {
        const rows = getValues(`ingredients.${groupIndex}.items`);
        replace([...rows.filter((row) => !isEmptyIngredient(row)), ...items]);
    };

    // Enter не отправляет форму, а ведёт дальше: из названия в количество, из количества в название следующей строки.
    // В последней строке добавляет новую, фокус в неё ставит сам append
    const handleRowKeyDown = (event: KeyboardEvent<HTMLLIElement>, index: number) => {
        if (event.key !== "Enter" || !(event.target instanceof HTMLInputElement)) return;
        event.preventDefault();

        const [name, amount] = event.currentTarget.querySelectorAll("input");
        if (event.target === name) {
            amount.focus();
        } else if (index < fields.length - 1) {
            setFocus(`ingredients.${groupIndex}.items.${index + 1}.name`);
        } else {
            append(EMPTY_INGREDIENT);
        }
    };

    return (
        <>
            <Reorder.Group ref={listRef} as="ul" {...groupProps} className={styles.list}>
                {fields.map((field, index) => (
                    <IngredientRow
                        key={field.id}
                        groupIndex={groupIndex}
                        index={index}
                        count={fields.length}
                        reorder={getItem(field, index)}
                        onRemove={removeRow}
                        onKeyDown={(event) => handleRowKeyDown(event, index)}
                    />
                ))}
            </Reorder.Group>
            <div className={styles.actions}>
                <AddButton label={t("ingredients.add")} onClick={() => append(EMPTY_INGREDIENT)} />
                <button type="button" className={styles.paste} onClick={() => setIsPasteOpen(true)}>
                    <FormIcon aria-hidden />
                    {t("ingredients.paste")}
                </button>
            </div>

            <PasteSheet isOpen={isPasteOpen} onClose={() => setIsPasteOpen(false)} onAdd={addPasted} />
        </>
    );
};

export default GroupItems;
