import { Suspense } from "react";
import { Route, Routes } from "react-router-dom";

import { routeConfig } from "./config";

export function AppRouter() {
    return (
        <Suspense fallback={<div>Загрузка...</div>}>
            <Routes>
                {routeConfig.map(({ path, element: Element }) => (
                    <Route key={path} path={path} element={<Element />} />
                ))}
            </Routes>
        </Suspense>
    );
}