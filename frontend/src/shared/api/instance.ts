import type { AppError } from "@recipe/common";
import WebApp from "@twa-dev/sdk";
import axios from "axios";

export class ApiError extends Error {
    code: string;
    status: number;

    constructor(appError: AppError, status: number) {
        super(appError.message);
        this.code = appError.code;
        this.status = status;
    }
}

export const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:3000",
    headers: {
        "Content-Type": "application/json",
    },
});

api.interceptors.request.use((config) => {
    const userId =
        WebApp.initDataUnsafe?.user?.id?.toString() ?? "dev-user";

    config.headers["x-user-id"] = userId;

    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (axios.isAxiosError(error) && error.response?.data?.code) {
            throw new ApiError(error.response.data as AppError, error.response.status);
        }

        throw error;
    }
);