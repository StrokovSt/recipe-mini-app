import { useState } from "react";

import { ApiError } from "@/shared/api";
import { getErrorMessage } from "@/shared/lib/errorMessages";
import { ErrorMessage } from "@/shared/ui/ErrorMessage";
import { Spinner } from "@/shared/ui/Spinner";

import styles from "./UrlBar.module.scss";

interface UrlBarProps {
    isParsing: boolean;
    error: Error | null;
    onSubmit: (url: string) => void;
}

const UrlBar = ({ isParsing, error, onSubmit }: UrlBarProps) => {
    const [url, setUrl] = useState("");

    const handleSubmit = () => {
        if (!url.trim()) return;
        onSubmit(url.trim());
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
                    onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                />
                <button
                    className={styles.btn}
                    onClick={handleSubmit}
                    disabled={isParsing || !url.trim()}
                >
                    {isParsing ? <Spinner size="sm" /> : "→"}
                </button>
            </div>
            {errorMessage && <ErrorMessage message={errorMessage} />}
        </div>
    );
};

export default UrlBar;