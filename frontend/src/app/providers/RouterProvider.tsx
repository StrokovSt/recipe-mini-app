import { type ReactNode, useState } from "react";
import { createBrowserRouter, RouterProvider as DataRouterProvider } from "react-router-dom";

interface Props {
    children: ReactNode;
}

// Data router нужен для useBlocker (подтверждение ухода с формы рецепта).
// Всё приложение — один маршрут «*», страницы по-прежнему выбирает AppRouter через <Routes>
export function RouterProvider({ children }: Props) {
    const [router] = useState(() => createBrowserRouter([{ path: "*", element: children }]));

    return <DataRouterProvider router={router} />;
}
