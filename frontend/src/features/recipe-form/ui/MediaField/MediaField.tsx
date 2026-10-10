import { useRef, useState } from "react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { useUploadMedia } from "@/entities/recipe";
import { IconButton, OutlineButton } from "@/shared/ui/Buttons";
import { Input } from "@/shared/ui/Input";
import { MediaLightbox } from "@/shared/ui/MediaLightbox";
import { Spinner } from "@/shared/ui/Spinner";

import type { RecipeFormValues } from "../../model/schema";
import FieldsetWrapper from "../FieldsetWrapper/FieldsetWrapper";

import styles from "./MediaField.module.scss";

const URL_REGEX = /^https?:\/\/.+\..+/i;
const VIDEO_REGEX = /\.(mp4|mov|avi|webm)/i;

const MediaField = () => {
    const { t } = useTranslation("recipeForm");
    const { watch, setValue, formState: { errors } } = useFormContext<RecipeFormValues>();
    const media = watch("media") ?? [];
    const fileRef = useRef<HTMLInputElement>(null);
    const [urlInput, setUrlInput] = useState("");
    const [urlError, setUrlError] = useState("");
    const [showUrlInput, setShowUrlInput] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

    const { mutate: upload, isPending: isUploading } = useUploadMedia();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        e.target.value = "";

        upload(file, {
            onSuccess: (data) => {
                setValue("media", [...media, { url: data.url, type: data.type }], { shouldValidate: true });
            },
        });
    };

    const handleAddUrl = () => {
        const trimmed = urlInput.trim();

        if (!trimmed) {
            setUrlError(t("media.emptyUrl"));
            return;
        }

        if (!URL_REGEX.test(trimmed)) {
            setUrlError(t("media.invalidUrl"));
            return;
        }

        const type = VIDEO_REGEX.test(trimmed) ? "video" : "image";
        setValue("media", [...media, { url: trimmed, type }], { shouldValidate: true });
        setUrlInput("");
        setUrlError("");
        setShowUrlInput(false);
    };

    const handleRemove = (i: number) => {
        setValue("media", media.filter((_, idx) => idx !== i), { shouldValidate: true });
        if (lightboxIndex === i) setLightboxIndex(null);
    };

    return (
        <FieldsetWrapper legend={t("media.legend")}>
            {media.length > 0 && (
                <div className={styles.list}>
                    {media.map((item, i) => (
                        <div key={i} className={styles.item} onClick={() => setLightboxIndex(i)}>
                            {item.type === "image" ? (
                                <img src={item.url} className={styles.preview} alt="" />
                            ) : (
                                <video src={item.url} className={styles.preview} />
                            )}
                            <IconButton
                                icon="close"
                                type="button"
                                className={styles.removeBtn}
                                onClick={(e) => { e.stopPropagation(); handleRemove(i); }}
                            />
                        </div>
                    ))}
                </div>
            )}

            {showUrlInput && (
                <div className={styles.urlBar}>
                    <Input
                        label={t("media.url")}
                        value={urlInput}
                        onChange={(e) => { setUrlInput(e.target.value); setUrlError(""); }}
                        onKeyDown={(e) => e.key === "Enter" && handleAddUrl()}
                        error={urlError}
                    />
                    <IconButton icon="forward" type="button" onClick={handleAddUrl} />
                </div>
            )}

            <div className={styles.actions}>
                <OutlineButton
                    label={t("media.upload")}
                    onClick={() => fileRef.current?.click()}
                    disabled={isUploading}
                    type="button"
                >
                    {isUploading ? <Spinner size="sm" /> : t("media.upload")}
                </OutlineButton>
                <input
                    ref={fileRef}
                    type="file"
                    accept="image/*,video/*"
                    className={styles.fileInput}
                    onChange={handleFileChange}
                />
                <OutlineButton
                    label={t("media.addLink")}
                    onClick={() => { setShowUrlInput((v) => !v); setUrlError(""); }}
                    disabled={isUploading}
                    type="button"
                >
                    {t("media.addLink")}
                </OutlineButton>
            </div>

            {errors.media?.message && (
                <span className={styles.error}>{errors.media.message}</span>
            )}

            {lightboxIndex !== null && (
                <MediaLightbox
                    media={media}
                    index={lightboxIndex}
                    onClose={() => setLightboxIndex(null)}
                    onChange={setLightboxIndex}
                />
            )}
        </FieldsetWrapper>
    );
};

export default MediaField;