import WebApp from "@twa-dev/sdk";
import axios from "axios";

export const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:3000",
    headers: {
        "Content-Type": "application/json",
    },
});

api.interceptors.request.use((config) => {
    const userId = WebApp.initDataUnsafe?.user?.id?.toString() ?? "dev-user";

    config.headers["x-user-id"] = userId;

    return config;
});