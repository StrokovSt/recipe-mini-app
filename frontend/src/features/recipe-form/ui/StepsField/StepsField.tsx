import { Reorder } from "motion/react";
import { useRef } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { useUploadMedia } from "@/entities/recipe";
import { collapseAndRemove } from "@/shared/lib/animations";
import { AddButton } from "@/shared/ui/Buttons";

import { EMPTY_STEP, type RecipeFormValues } from "../../model/schema";
import { useReorderList } from "../../model/useReorderList";
import { useUndoToast } from "../../model/useUndoToast";
import StepItem from "./StepItem";

import styles from "./StepsField.module.scss";

// Вкладка «Приготовление»: шаги карточками с номером, текстом и фото. Шаг перетаскивают за печать с номером
const StepsField = () => {
    const { t } = useTranslation("recipeForm");
    const { control, getValues, formState: { errors } } = useFormContext<RecipeFormValues>();
    const { fields, append, insert, move, remove } = useFieldArray({ control, name: "steps" });
    const { mutateAsync: uploadMedia } = useUploadMedia();
    const showUndo = useUndoToast();
    const listRef = useRef<HTMLOListElement>(null);
    const { groupProps, getItem } = useReorderList(fields, move, listRef);

    // Шаг плавно схлопывается и удаляется. С текстом или фото его можно вернуть из уведомления на прежнее место,
    // пустой удаляется молча. Последний шаг уходит вместе со списком, поэтому схлопывается весь список
    const removeStep = (stepElement: HTMLElement) => {
        const target = fields.length === 1 && listRef.current ? listRef.current : stepElement;

        void collapseAndRemove(target, () => {
            // Пока шаг схлопывался, выше могли удалить другой: его место берём по порядку в списке
            const index = Array.from(listRef.current?.children ?? []).indexOf(stepElement);
            if (index === -1) return;

            const step = getValues(`steps.${index}`);
            remove(index);
            if (!step.text.trim() && step.images.length === 0) return;

            showUndo(t("steps.removed"), () => insert(index, step));
        });
    };

    const uploadPhoto = async (file: File) => (await uploadMedia(file)).url;

    return (
        <>
            {fields.length > 0 && (
                <Reorder.Group ref={listRef} as="ol" {...groupProps} className={styles.list}>
                    {fields.map((field, index) => (
                        <StepItem
                            key={field.id}
                            index={index}
                            count={fields.length}
                            reorder={getItem(field, index)}
                            onUpload={uploadPhoto}
                            onRemove={removeStep}
                        />
                    ))}
                </Reorder.Group>
            )}

            {/* Под последним шагом: новый шаг появляется там же, где кнопка */}
            <AddButton label={t("steps.add")} className={styles.add} onClick={() => append(EMPTY_STEP)} />

            {errors.steps?.message && <p className={styles.error} role="alert">{errors.steps.message}</p>}
        </>
    );
};

export default StepsField;
