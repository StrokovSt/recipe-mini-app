export enum ErrorCode {
    PARSE_FAILED = "PARSE_FAILED",
    RECIPE_NOT_FOUND = "RECIPE_NOT_FOUND",
    INVALID_URL = "INVALID_URL",
    AI_UNAVAILABLE = "AI_UNAVAILABLE",
    VALIDATION_ERROR = "VALIDATION_ERROR",
}

export interface AppError {
    code: ErrorCode;
    message: string;
}

export function createError(code: ErrorCode, message: string): AppError {
    return { code, message };
}