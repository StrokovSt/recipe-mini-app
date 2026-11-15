import { lazy, type ReactNode, Suspense } from "react";

import { useMe } from "@/entities/user";
import { ApiError } from "@/shared/api";
import { getTelegram } from "@/shared/lib/telegram";

// Страница входа нужна только на сайте, её код качается, только когда она открывается
const LoginPage = lazy(() => import("@/pages/LoginPage").then((m) => ({ default: m.LoginPage })));

interface Props {
    children: ReactNode;
}

// Сайт без входа видит только страницу входа. В мини-аппе вход всегда есть: запросы подписаны initData
export function AuthGate({ children }: Props) {
    const { data, error } = useMe();

    if (getTelegram()?.initData) return children;

    // 401 важнее уже загруженного профиля: сессия могла истечь, пока приложение открыто
    if (error instanceof ApiError && error.status === 401) {
        return (
            <Suspense fallback={null}>
                <LoginPage />
            </Suspense>
        );
    }

    // Нет сети или бэкенд недоступен: приложение само покажет ошибку. Пока ждём ответа, на экране заставка
    return data || error ? children : null;
}
