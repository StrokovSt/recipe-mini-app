import { useRef, useState } from "react";

import { ApiError } from "@/shared/api";
import { getErrorMessage } from "@/shared/lib/errorMessages";
import { ErrorMessage } from "@/shared/ui/ErrorMessage";
import { Spinner } from "@/shared/ui/Spinner";

import styles from "./AiInput.module.scss";

interface AiInputProps {
    isParsing: boolean;
    error: Error | null;
    onSubmitUrl: (url: string) => void;
    onSubmitImage: (file: File) => void;
}

const AiInput = ({ isParsing, error, onSubmitUrl, onSubmitImage }: AiInputProps) => {
    const [url, setUrl] = useState("");
    const fileRef = useRef<HTMLInputElement>(null);

    const handleSubmitUrl = () => {
        if (!url.trim()) return;
        onSubmitUrl(url.trim());
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) onSubmitImage(file);
    };

    const errorCode = error instanceof ApiError ? error.code : undefined;
    const errorMessage = error ? getErrorMessage(errorCode, error.message) : null;

    return (
        <div className={styles.wrap}>
            <div className={styles.bar}>
                <input
                    className={styles.input}
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="Вставь ссылку на Pinterest..."
                    onKeyDown={(e) => e.key === "Enter" && handleSubmitUrl()}
                />
                <button
                    className={styles.btn}
                    onClick={handleSubmitUrl}
                    disabled={isParsing || !url.trim()}
                >
                    {isParsing ? <Spinner size="sm" /> : "→"}
                </button>
            </div>

            <button
                type="button"
                className={styles.imageBtn}
                onClick={() => fileRef.current?.click()}
                disabled={isParsing}
            >
                {isParsing ? <Spinner size="sm" /> : "📷 Загрузить фото"}
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