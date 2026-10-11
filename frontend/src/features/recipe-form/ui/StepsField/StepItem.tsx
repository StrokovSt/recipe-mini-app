import { useFormContext, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { IconButton } from "@/shared/ui/Buttons";
import { TextareaController } from "@/shared/ui/Input";

import type { RecipeFormValues } from "../../model/schema";
import StepPhotos from "../StepPhotos/StepPhotos";

import styles from "./StepsField.module.scss";

interface StepItemProps {
    index: number;
    onUpload: (file: File) => Promise<string>;
    // Нет, если шаг единственный
    onRemove?: () => void;
}

// Шаг: номер, текст, крестик удаления, под текстом фото
const StepItem = ({ index, onUpload, onRemove }: StepItemProps) => {
    const { t } = useTranslation("recipeForm");
    const { control, getValues, setValue } = useFormContext<RecipeFormValues>();
    const images = useWatch({ control, name: `steps.${index}.images` });

    const setImages = (next: string[]) => setValue(`steps.${index}.images`, next, { shouldDirty: true });

    return (
        <li className={styles.step}>
            <span className={styles.number} aria-hidden>{index + 1}</span>
            <TextareaController
                name={`steps.${index}.text`}
                control={control}
                label={t("steps.item", { number: index + 1 })}
                className={styles.text}
            />
            {onRemove && (
                <IconButton
                    icon="close"
                    variant="empty"
                    type="button"
                    className={styles.remove}
                    aria-label={t("steps.remove")}
                    onClick={onRemove}
                />
            )}
            <StepPhotos
                className={styles.content}
                images={images}
                onUpload={onUpload}
                onAdd={(urls) => setImages([...getValues(`steps.${index}.images`), ...urls])}
                onRemove={(photoIndex) => setImages(images.filter((_, i) => i !== photoIndex))}
            />
        </li>
    );
};

export default StepItem;
