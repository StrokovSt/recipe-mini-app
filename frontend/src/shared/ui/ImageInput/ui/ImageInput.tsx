import clsx from "clsx";
import { AnimatePresence, motion } from "motion/react";
import { type ChangeEvent, type DragEvent, type KeyboardEvent, useState } from "react";
import { useTranslation } from "react-i18next";

import ImageIcon from "@/shared/assets/icons/icon-image.svg?react";
import SpinnerIcon from "@/shared/assets/spinner.svg?react";
import { TRANSITION_BASE } from "@/shared/config/animation";
import { IconButton } from "@/shared/ui/Buttons";
import { Input } from "@/shared/ui/Input";

import styles from "./ImageInput.module.scss";

const URL_REGEX = /^https?:\/\/\S+\.\S+$/i;

const URL_ROW_HIDDEN = { height: 0, opacity: 0 };
const URL_ROW_VISIBLE = { height: "auto", opacity: 1 };

interface ImageInputProps {
    value: string | null;
    onChange: (url: string | null) => void;
    // Загружает файл на сервер и возвращает ссылку на картинку
    onUpload: (file: File) => Promise<string>;
    className?: string;
}

// Картинка из файла (выбор или перетаскивание) или по ссылке. Высота всегда одна:
// пока картинки нет — зона и строка ссылки, потом превью на всю высоту с кнопкой сброса
export const ImageInput = (props: ImageInputProps) => {
    const { value, onChange, onUpload, className } = props;
    const { t } = useTranslation();
    const [url, setUrl] = useState("");
    const [urlError, setUrlError] = useState("");
    const [uploadError, setUploadError] = useState("");
    const [isUploading, setIsUploading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    // Какая ссылка уже загрузилась и какая не открылась: при новой ссылке всё начинается заново
    const [loadedUrl, setLoadedUrl] = useState<string | null>(null);
    const [brokenUrl, setBrokenUrl] = useState<string | null>(null);

    const isBroken = value !== null && brokenUrl === value;
    const isLoading = value !== null && loadedUrl !== value && !isBroken;

    const uploadFile = async (file: File) => {
        setIsUploading(true);
        setUploadError("");
        try {
            onChange(await onUpload(file));
        } catch {
            setUploadError(t("imageInput.uploadFailed"));
        } finally {
            setIsUploading(false);
        }
    };

    const handleFile = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        event.target.value = "";
        if (file) uploadFile(file);
    };

    const handleDragOver = (event: DragEvent<HTMLLabelElement>) => {
        event.preventDefault();
        setIsDragging(true);
    };

    // dragleave приходит и при переходе на дочерний элемент зоны, его пропускаем
    const handleDragLeave = (event: DragEvent<HTMLLabelElement>) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setIsDragging(false);
    };

    // Файл с компьютера или картинка, перетащенная из другой вкладки (приходит ссылкой)
    const handleDrop = (event: DragEvent<HTMLLabelElement>) => {
        event.preventDefault();
        setIsDragging(false);
        if (isUploading) return;

        const file = event.dataTransfer.files[0];
        if (file) {
            if (file.type.startsWith("image/")) uploadFile(file);
            return;
        }

        const link = event.dataTransfer.getData("text/uri-list").split("\n")[0].trim();
        if (URL_REGEX.test(link)) onChange(link);
    };

    const applyUrl = () => {
        const trimmed = url.trim();
        if (!URL_REGEX.test(trimmed)) {
            setUrlError(t("imageInput.invalidUrl"));
            return;
        }

        onChange(trimmed);
        setUrl("");
    };

    // Enter применяет ссылку и не отправляет форму, в которой лежит поле
    const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key !== "Enter") return;
        event.preventDefault();
        applyUrl();
    };

    const zoneTitle = isUploading
        ? t("imageInput.uploading")
        : isDragging ? t("imageInput.drop") : t("imageInput.add");

    return (
        <div className={clsx(styles.wrap, className)}>
            {value ? (
                <div className={styles.preview}>
                    {isBroken ? (
                        <p className={styles.broken}>{t("imageInput.broken")}</p>
                    ) : (
                        <img
                            src={value}
                            alt=""
                            className={clsx(!isLoading && styles.loaded)}
                            onLoad={() => setLoadedUrl(value)}
                            onError={() => setBrokenUrl(value)}
                        />
                    )}
                    {isLoading && <SpinnerIcon className={styles.spinner} aria-hidden />}
                    <IconButton
                        icon="close"
                        round
                        type="button"
                        className={styles.remove}
                        aria-label={t("imageInput.remove")}
                        onClick={() => onChange(null)}
                    />
                </div>
            ) : (
                <label
                    className={clsx(styles.zone, isUploading && styles.uploading, isDragging && styles.dragging)}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                >
                    <input
                        type="file"
                        accept="image/*"
                        className={styles.file}
                        disabled={isUploading}
                        onChange={handleFile}
                    />
                    {isUploading ? (
                        <SpinnerIcon className={styles.icon} aria-hidden />
                    ) : (
                        <ImageIcon className={styles.icon} aria-hidden />
                    )}
                    <span className={styles.title}>{zoneTitle}</span>
                    <span className={clsx(styles.hint, uploadError && styles.error)}>
                        {uploadError || t("imageInput.hint")}
                    </span>
                </label>
            )}

            <AnimatePresence initial={false}>
                {!value && (
                    <motion.div
                        className={styles.url}
                        initial={URL_ROW_HIDDEN}
                        animate={URL_ROW_VISIBLE}
                        exit={URL_ROW_HIDDEN}
                        transition={TRANSITION_BASE}
                    >
                        <Input
                            label={t("imageInput.url")}
                            type="url"
                            inputMode="url"
                            value={url}
                            error={urlError}
                            disabled={isUploading}
                            onChange={(event) => {
                                setUrl(event.target.value);
                                setUrlError("");
                            }}
                            onKeyDown={handleKeyDown}
                        />
                        <IconButton
                            icon="forward"
                            type="button"
                            className={styles.apply}
                            aria-label={t("imageInput.apply")}
                            disabled={!url.trim() || isUploading}
                            onClick={applyUrl}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
