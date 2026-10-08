import { AnimatePresence } from "motion/react";
import { Suspense } from "react";
import { Route, Routes, useLocation } from "react-router-dom";

import { Spinner } from "@/shared/ui/Spinner";

import { routeConfig } from "./config";

export function AppRouter() {
    const location = useLocation();

    return (
        <Suspense fallback={<Spinner size='xl' />}>
            <AnimatePresence mode="wait" initial={false}>
                <Routes location={location} key={location.pathname}>
                    {routeConfig.map(({ path, element: Element }) => (
                        <Route key={path} path={path} element={<Element />} />
                    ))}
                </Routes>
            </AnimatePresence>
        </Suspense>
    );
}
