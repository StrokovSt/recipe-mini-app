import { AnimatePresence } from "motion/react";
import { Suspense } from "react";
import { Route, Routes, useLocation } from "react-router-dom";

import { routeConfig } from "./config";

export function AppRouter() {
    const location = useLocation();

    // fallback не нужен: шапка общая и стоит на месте, а котик показывается в самих страницах
    return (
        <Suspense fallback={null}>
            <AnimatePresence mode="wait" initial={false}>
                <Routes location={location} key={location.pathname}>
                    {routeConfig.map(({ path, page: { Component } }) => (
                        <Route key={path} path={path} element={<Component />} />
                    ))}
                </Routes>
            </AnimatePresence>
        </Suspense>
    );
}
