import clsx from "clsx";
import { type ChangeEvent, type DragEvent, useState } from "react";
import { useTranslation } from "react-i18next";

import CloseIcon from "@/shared/assets/icons/icon-close.svg?react";
import ImageIcon from "@/shared/assets/icons/icon-image.svg?react";
import SpinnerIcon from "@/shared/assets/spinner.svg?react";

import styles from "./StepPhotos.module.scss";

interface StepPhotosProps {
    images: string[];
    onAdd: (urls: string[]) => void;
    onRemove: (index: number) => void;
    // Загружает файл на сервер и возвращает ссылку на картинку
    onUpload: (file: File) => Promise<string>;
    className?: string;
}

// Фото шага: миниатюры с крестиком и плитка добавления (выбор нескольких файлов или перетаскивание)
const StepPhotos = ({ images, onAdd, onRemove, onUpload, className }: StepPhotosProps) => {
    const { t } = useTranslation(["recipeForm", "common"]);
    const [uploading, setUploading] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [hasError, setHasError] = useState(false);

    // Файлы грузятся параллельно, пока идут — на их месте плитки со спиннером
    const uploadFiles = async (files: File[]) => {
        const imageFiles = files.filter((file) => file.type.startsWith("image/"));
        if (imageFiles.length === 0) return;

        setHasError(false);
        setUploading((count) => count + imageFiles.length);
        const results = await Promise.allSettled(imageFiles.map(onUpload));
        setUploading((count) => count - imageFiles.length);

        const urls = results.flatMap((result) => (result.status === "fulfilled" ? [result.value] : []));
        if (urls.length > 0) onAdd(urls);
        if (urls.length < results.length) setHasError(true);
    };

    const handleFiles = (event: ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files ?? []);
        event.target.value = "";
        uploadFiles(files);
    };

    const handleDragOver = (event: DragEvent<HTMLLabelElement>) => {
        event.preventDefault();
        setIsDragging(true);
    };

    const handleDrop = (event: DragEvent<HTMLLabelElement>) => {
        event.preventDefault();
        setIsDragging(false);
        uploadFiles(Array.from(event.dataTransfer.files));
    };

    return (
        <div className={className}>
            <ul className={styles.list}>
                {images.map((url, index) => (
                    <li key={`${index}:${url}`} className={styles.photo}>
                        <img src={url} alt="" />
                        <button
                            type="button"
                            className={styles.remove}
                            aria-label={t("steps.removePhoto")}
                            onClick={() => onRemove(index)}
                        >
                            <CloseIcon />
                        </button>
                    </li>
                ))}

                {Array.from({ length: uploading }, (_, index) => (
                    <li key={`uploading-${index}`} className={clsx(styles.photo, styles.uploading)}>
                        <SpinnerIcon aria-label={t("common:imageInput.uploading")} />
                    </li>
                ))}

                <li>
                    <label
                        className={clsx(styles.add, isDragging && styles.dragging)}
                        onDragOver={handleDragOver}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={handleDrop}
                    >
                        <input type="file" accept="image/*" multiple className={styles.file} onChange={handleFiles} />
                        <ImageIcon aria-hidden />
                        {t("steps.photo")}
                    </label>
                </li>
            </ul>

            {hasError && <p className={styles.error}>{t("common:imageInput.uploadFailed")}</p>}
        </div>
    );
};

export default StepPhotos;
