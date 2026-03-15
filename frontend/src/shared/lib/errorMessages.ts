import { ErrorCode } from "@recipe/common";

export const ERROR_MESSAGES: Record<ErrorCode, string> = {
    [ErrorCode.PARSE_FAILED]: "Не удалось разобрать рецепт. Попробуй другую ссылку.",
    [ErrorCode.RECIPE_NOT_FOUND]: "Рецепт не найден.",
    [ErrorCode.INVALID_URL]: "Некорректная ссылка.",
    [ErrorCode.AI_UNAVAILABLE]: "AI-сервис временно недоступен. Попробуй позже.",
    [ErrorCode.AI_QUOTA_EXCEEDED]: "Превышен дневной лимит запросов. Попробуй завтра.",
    [ErrorCode.VALIDATION_ERROR]: "Ошибка валидации данных.",
    [ErrorCode.LIMIT_REACHED]: "Достигнут лимит рецептов. Оформи подписку для неограниченного доступа."
};

export function getErrorMessage(code: string | undefined, fallback?: string): string {
    if (code && code in ERROR_MESSAGES) {
        return ERROR_MESSAGES[code as ErrorCode];
    }

    return fallback ?? "Что-то пошло не так.";
}