import { ApiError } from "@/shared/api";
import { getErrorMessage } from "@/shared/lib/errorMessages";
import { ErrorMessage } from "@/shared/ui/ErrorMessage";
import { Spinner } from "@/shared/ui/Spinner";

import styles from "./UrlForm.module.scss";

interface UrlFormProps {
    url: string;
    isParsing: boolean;
    error: Error | null;
    onUrlChange: (url: string) => void;
    onSubmit: () => void;
}

export function UrlForm(props: UrlFormProps) {
    const { url, isParsing, error, onUrlChange, onSubmit } = props;

    const errorCode = error instanceof ApiError ? error.code : undefined;
    const errorMessage = error ? getErrorMessage(errorCode, error.message) : null;

    return (
        <div className={styles.wrap}>
            <p className={styles.hint}>Вставь ссылку на рецепт из Pinterest</p>

            <input
                className={styles.input}
                value={url}
                onChange={(e) => onUrlChange(e.target.value)}
                placeholder="https://pinterest.com/..."
                onKeyDown={(e) => e.key === "Enter" && onSubmit()}
            />

            {errorMessage && <ErrorMessage message={errorMessage} />}

            <button
                className={styles.btn}
                onClick={onSubmit}
                disabled={isParsing || !url.trim()}
            >
                {isParsing ? <Spinner size="sm" /> : "Извлечь рецепт"}
            </button>
        </div>
    );
}