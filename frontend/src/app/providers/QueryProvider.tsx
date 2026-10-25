import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type ReactNode } from "react";

import { ApiError } from "@/shared/api";

// Код ответа (например, 404 «Рецепт не найден»). Без сети кода нет
const getStatus = (error: Error) => (error instanceof ApiError ? error.status : undefined);

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
            // Без сети всё равно делаем запрос: service worker отдаст сохранённый ответ
            networkMode: "offlineFirst",
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
        </QueryClientProvider>
    );
}