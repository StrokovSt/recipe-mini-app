export const ErrorCode = {
    PARSE_FAILED: "PARSE_FAILED",
    RECIPE_NOT_FOUND: "RECIPE_NOT_FOUND",
    INVALID_URL: "INVALID_URL",
    AI_UNAVAILABLE: "AI_UNAVAILABLE",
    AI_QUOTA_EXCEEDED: "AI_QUOTA_EXCEEDED",
    VALIDATION_ERROR: "VALIDATION_ERROR",
    LIMIT_REACHED: "LIMIT_REACHED",
    AI_DISABLED: "AI_DISABLED",
} as const;

export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode];

export interface AppError {
    code: ErrorCode;
    message: string;
}

export function createError(code: ErrorCode, message: string): AppError {
    return { code, message };
}