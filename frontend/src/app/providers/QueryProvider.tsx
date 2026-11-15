import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type ReactNode } from "react";

import { USER_KEYS } from "@/entities/user";
import { ApiError } from "@/shared/api";

// Код ответа (например, 404 «Рецепт не найден»). Без сети кода нет
const getStatus = (error: Error) => (error instanceof ApiError ? error.status : undefined);

// Сессия на сайте истекла: запросы отвечают 401. Перезапрашиваем профиль, он тоже получит 401,
// и AuthGate откроет страницу входа
const handleUnauthorized = (error: Error) => {
    if (getStatus(error) === 401) queryClient.invalidateQueries({ queryKey: USER_KEYS.me });
};

const queryClient = new QueryClient({
    queryCache: new QueryCache({
        // Кроме самого профиля: иначе он перезапрашивал бы себя по кругу
        onError: (error, query) => {
            if (query.queryKey[0] !== USER_KEYS.me[0]) handleUnauthorized(error);
        },
    }),
    mutationCache: new MutationCache({ onError: handleUnauthorized }),
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