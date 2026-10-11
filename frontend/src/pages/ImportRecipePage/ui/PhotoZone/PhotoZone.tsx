import clsx from "clsx";
import { type ChangeEvent, type DragEvent, useState } from "react";
import { useTranslation } from "react-i18next";

import ImageIcon from "@/shared/assets/icons/icon-image.svg?react";
import { IconButton } from "@/shared/ui/Buttons";

import styles from "./PhotoZone.module.scss";

// Файл и ссылка на него для превью (object URL)
export interface Photo {
    file: File;
    url: string;
}

interface PhotoZoneProps {
    value: Photo | null;
    onChange: (photo: Photo | null) => void;
    disabled?: boolean;
}

// Скриншот или фото рецепта: выбор, перетаскивание, превью с кнопкой сброса.
// На сервер файл уходит только по кнопке «Распознать», здесь он просто запоминается
const PhotoZone = ({ value, onChange, disabled }: PhotoZoneProps) => {
    const { t } = useTranslation(["recipeForm", "common"]);
    const [isDragging, setIsDragging] = useState(false);

    const change = (file: File | null) => {
        if (value) URL.revokeObjectURL(value.url);
        onChange(file && { file, url: URL.createObjectURL(file) });
    };

    const handleFile = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        event.target.value = "";
        if (file) change(file);
    };

    const handleDragOver = (event: DragEvent<HTMLLabelElement>) => {
        event.preventDefault();
        setIsDragging(true);
    };

    // dragleave приходит и при переходе на дочерний элемент зоны, его пропускаем
    const handleDragLeave = (event: DragEvent<HTMLLabelElement>) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setIsDragging(false);
    };

    const handleDrop = (event: DragEvent<HTMLLabelElement>) => {
        event.preventDefault();
        setIsDragging(false);

        const file = event.dataTransfer.files[0];
        if (!disabled && file?.type.startsWith("image/")) change(file);
    };

    if (value) {
        return (
            <div className={styles.preview}>
                <img src={value.url} alt="" />
                <IconButton
                    icon="close"
                    round
                    type="button"
                    className={styles.remove}
                    aria-label={t("common:imageInput.remove")}
                    disabled={disabled}
                    onClick={() => change(null)}
                />
            </div>
        );
    }

    return (
        <label
            className={clsx(styles.zone, isDragging && styles.dragging)}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            <input type="file" accept="image/*" className={styles.file} disabled={disabled} onChange={handleFile} />
            <ImageIcon className={styles.icon} aria-hidden />
            <span className={styles.title}>{isDragging ? t("common:imageInput.drop") : t("import.photo")}</span>
            <span className={styles.hint}>{t("import.photoHint")}</span>
        </label>
    );
};

export default PhotoZone;
