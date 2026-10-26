import { useRef } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { collapseAndRemove, insertAndExpand } from "@/shared/lib/animations";
import { AddButton, IconButton } from "@/shared/ui/Buttons";
import { Input } from "@/shared/ui/Input";

import { EMPTY_INGREDIENT, isEmptyIngredient, type RecipeFormValues } from "../../model/schema";
import { useUndoToast } from "../../model/useUndoToast";
import GroupItems from "./GroupItems";

import styles from "./IngredientsField.module.scss";

// Вкладка «Ингредиенты»: группы, в каждой название группы и строки ингредиентов
const IngredientsField = () => {
    const { t } = useTranslation("recipeForm");
    const { control, register, setFocus, getValues, formState: { errors } } = useFormContext<RecipeFormValues>();
    const { fields: groups, append, insert, remove } = useFieldArray({ control, name: "ingredients" });
    const showUndo = useUndoToast();
    const listRef = useRef<HTMLDivElement>(null);

    // Группа плавно схлопывается и удаляется, непустую можно вернуть из уведомления
    const removeGroup = (groupIndex: number) => {
        const groupElement = listRef.current?.children[groupIndex];
        if (!(groupElement instanceof HTMLElement)) return;

        void collapseAndRemove(groupElement, () => {
            // Пока группа схлопывалась, выше могли удалить другую: её место берём по порядку в списке.
            // Последнюю оставшуюся группу не удаляем, она снова появится
            const index = Array.from(listRef.current?.children ?? []).indexOf(groupElement);
            if (index === -1 || getValues("ingredients").length === 1) return;

            const group = getValues(`ingredients.${index}`);
            remove(index);
            if (!group.title?.trim() && group.items.every(isEmptyIngredient)) return;

            showUndo(t("ingredients.groupRemoved"), () =>
                insertAndExpand(() => insert(index, group), () => listRef.current?.children[index]),
            );
        });
    };

    return (
        <>
            <div ref={listRef} className={styles.groups}>
                {groups.map((group, groupIndex) => (
                    <div key={group.id} className={styles.group}>
                        <div className={styles.groupHeader}>
                            {/* Enter в названии группы ведёт к первому ингредиенту, а не отправляет форму */}
                            <Input
                                variant="line"
                                enterKeyHint="next"
                                onKeyDown={(event) => {
                                    if (event.key !== "Enter") return;
                                    event.preventDefault();
                                    setFocus(`ingredients.${groupIndex}.items.0.name`);
                                }}
                                register={register(`ingredients.${groupIndex}.title`)}
                                label={t("ingredients.groupTitle")}
                                className={styles.groupTitle}
                            />
                            {groups.length > 1 && (
                                <IconButton
                                    icon="close"
                                    variant="empty"
                                    type="button"
                                    className={styles.remove}
                                    aria-label={t("ingredients.removeGroup")}
                                    onClick={() => removeGroup(groupIndex)}
                                />
                            )}
                        </div>
                        <GroupItems groupIndex={groupIndex} />
                    </div>
                ))}
            </div>

            <AddButton
                label={t("ingredients.addGroup")}
                onClick={() => append({ title: null, items: [EMPTY_INGREDIENT] })}
            />

            {errors.ingredients?.message && <p className={styles.error} role="alert">{errors.ingredients.message}</p>}
        </>
    );
};

export default IngredientsField;
