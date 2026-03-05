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

export function isAppError(error: unknown): error is { response: { data: AppError } } {
    return (
        typeof error === "object" &&
        error !== null &&
        "response" in error &&
        typeof (error as { response: unknown }).response === "object"
    );
}