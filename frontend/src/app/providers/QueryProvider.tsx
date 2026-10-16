import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { isAxiosError } from "axios";
import { type ReactNode } from "react";

import { ApiError } from "@/shared/api";

// Код ответа: ApiError, если бэкенд прислал code, иначе обычная ошибка axios (например, 404 «Рецепт не найден»)
const getStatus = (error: Error) => {
    if (error instanceof ApiError) return error.status;
    if (isAxiosError(error)) return error.response?.status;
};

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5,
            // Ошибки 4xx (например, рецепт не найден) повтор не исправит: показываем сразу
            retry: (failureCount, error) => {
                const status = getStatus(error);
                return !(status && status < 500) && failureCount < 1;
            },
            refetchOnWindowFocus: false,
            refetchOnReconnect: true,
        },
        mutations: {
            retry: 0,
        },
    },
});

interface Props {
    children: ReactNode;
}

export function QueryProvider({ children }: Props) {
    return (
        <QueryClientProvider client={queryClient}>
            {children}
            {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={true} />}
        </QueryClientProvider>
    );
}