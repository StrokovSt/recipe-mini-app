import i18next from "i18next";

import { ErrorCode } from "@recipe/common";

const ERROR_CODES: string[] = Object.values(ErrorCode);

// Текст ошибки по коду с бэка на языке интерфейса (словарь common, раздел errors)
export function getErrorMessage(code: string | undefined, fallback?: string): string {
    if (code && ERROR_CODES.includes(code)) {
        return i18next.t(`errors.${code as ErrorCode}`);
    }

    return fallback ?? i18next.t("errors.unknown");
}
