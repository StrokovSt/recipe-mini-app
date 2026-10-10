import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { ApiError } from "@/shared/api";
import { getErrorMessage } from "@/shared/lib/errors";
import { IconButton } from "@/shared/ui/Buttons";
import { ErrorMessage } from "@/shared/ui/ErrorMessage";
import { Input } from "@/shared/ui/Input";
import { Spinner } from "@/shared/ui/Spinner";

import styles from "./AiInput.module.scss";

interface AiInputProps {
    isParsing: boolean;
    isParsingImage: boolean;
    error: Error | null;
    onSubmitUrl: (url: string) => void;
    onSubmitImage: (file: File) => void;
}

const AiInput = ({ isParsing, isParsingImage, error, onSubmitUrl, onSubmitImage }: AiInputProps) => {
    const { t } = useTranslation("recipeForm");
    const [url, setUrl] = useState("");
    const fileRef = useRef<HTMLInputElement>(null);

    const handleSubmitUrl = () => {
        if (!url.trim()) return;
        onSubmitUrl(url.trim());
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) onSubmitImage(file);
        e.target.value = "";
    };

    const errorCode = error instanceof ApiError ? error.code : undefined;
    const errorMessage = error ? getErrorMessage(errorCode, error.message) : null;

    return (
        <div className={styles.wrap}>
            <div className={styles.bar}>
                <Input
                    label={t("ai.url")}
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSubmitUrl()}
                    disabled={isParsing || isParsingImage}
                />
                <IconButton 
                    icon="forward"
                    variant="accent"
                    type="button"
                    onClick={handleSubmitUrl}
                    disabled={isParsing || isParsingImage || !url.trim()}
                />
            </div>

            <button
                type="button"
                className={styles.imageBtn}
                onClick={() => fileRef.current?.click()}
                disabled={isParsing || isParsingImage}
            >
                {isParsingImage ? <Spinner size="sm" /> : t("ai.uploadPhoto")}
            </button>
            <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className={styles.fileInput}
                onChange={handleFileChange}
            />

            {errorMessage && <ErrorMessage message={errorMessage} />}
        </div>
    );
};

export default AiInput;