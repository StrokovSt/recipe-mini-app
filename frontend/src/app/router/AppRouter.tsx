import { Suspense } from "react";
import { Route, Routes } from "react-router-dom";

import { Spinner } from "@/shared/ui/Spinner";

import { routeConfig } from "./config";

export function AppRouter() {
    return (
        <Suspense fallback={<Spinner size='xl' />}>
            <Routes>
                {routeConfig.map(({ path, element: Element }) => (
                    <Route key={path} path={path} element={<Element />} />
                ))}
            </Routes>
        </Suspense>
    );
}