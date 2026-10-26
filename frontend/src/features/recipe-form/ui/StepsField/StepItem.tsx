import clsx from "clsx";
import { Reorder, useDragControls } from "motion/react";
import { type KeyboardEvent, useRef } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";

import ArrowIcon from "@/shared/assets/icons/icon-back.svg?react";
import DeleteIcon from "@/shared/assets/icons/icon-delete.svg?react";
import GripIcon from "@/shared/assets/icons/icon-grip.svg?react";
import MoreIcon from "@/shared/assets/icons/icon-more.svg?react";
import { Dropdown, type DropdownItem } from "@/shared/ui/Dropdown";
import { TextareaController } from "@/shared/ui/Input";

import { getArrowMove } from "../../model/reorder";
import type { RecipeFormValues } from "../../model/schema";
import type { ReorderItem } from "../../model/useReorderList";
import StepPhotos from "../StepPhotos/StepPhotos";

import styles from "./StepsField.module.scss";

interface StepItemProps {
    index: number;
    // Сколько всего шагов: дальше последнего не сдвинуть
    count: number;
    reorder: ReorderItem;
    onUpload: (file: File) => Promise<string>;
    onRemove: (step: HTMLElement) => void;
}

// Шаг карточкой: «Шаг N» печатью на рамке, ⋯ с меню «Выше / Ниже / Удалить», текст, под ним фото.
// За печать шаг перетаскивают, с клавиатуры двигают стрелками вверх и вниз
const StepItem = ({ index, count, reorder, onUpload, onRemove }: StepItemProps) => {
    const { t } = useTranslation("recipeForm");
    const { control, getValues, setValue } = useFormContext<RecipeFormValues>();
    const images = useWatch({ control, name: `steps.${index}.images` });
    const dragControls = useDragControls();
    const stepRef = useRef<HTMLLIElement>(null);
    const number = index + 1;

    const setImages = (next: string[]) => setValue(`steps.${index}.images`, next, { shouldDirty: true });

    const actions: DropdownItem[] = [
        ...(index > 0
            ? [{ label: t("steps.moveUp"), icon: <ArrowIcon className={styles.up} />, onClick: () => reorder.move(index - 1) }]
            : []),
        ...(index < count - 1
            ? [{ label: t("steps.moveDown"), icon: <ArrowIcon className={styles.down} />, onClick: () => reorder.move(index + 1) }]
            : []),
        {
            label: t("steps.remove"),
            icon: <DeleteIcon />,
            danger: true,
            onClick: () => stepRef.current && onRemove(stepRef.current),
        },
    ];

    // Шаг переезжает в DOM, и браузер снимает с печати фокус: возвращаем его
    const handleSealKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
        const to = getArrowMove(event.key, index, count);
        if (to === undefined) return;
        event.preventDefault();

        const seal = event.currentTarget;
        reorder.move(to);
        requestAnimationFrame(() => seal.focus());
    };

    return (
        <Reorder.Item
            ref={stepRef}
            as="li"
            {...reorder.props}
            dragControls={dragControls}
            className={clsx(styles.step, reorder.isLifted && styles.dragging)}
        >
            <button
                type="button"
                className={styles.seal}
                aria-label={t("steps.reorder", { number })}
                aria-keyshortcuts="ArrowUp ArrowDown"
                onPointerDown={(event) => dragControls.start(event)}
                onKeyDown={handleSealKeyDown}
            >
                <GripIcon aria-hidden />
                {t("steps.item", { number })}
            </button>
            <Dropdown
                trigger={
                    <button
                        type="button"
                        className={styles.menuButton}
                        aria-label={t("steps.actions", { number })}
                    >
                        <MoreIcon />
                    </button>
                }
                items={actions}
            />
            <TextareaController
                variant="line"
                name={`steps.${index}.text`}
                control={control}
                label={t("steps.item", { number })}
                placeholder={t("steps.placeholder")}
                hideLabel
                className={styles.text}
            />
            <StepPhotos
                images={images}
                onUpload={onUpload}
                onAdd={(urls) => setImages([...getValues(`steps.${index}.images`), ...urls])}
                onRemove={(photoIndex) => setImages(images.filter((_, i) => i !== photoIndex))}
            />
        </Reorder.Item>
    );
};

export default StepItem;
