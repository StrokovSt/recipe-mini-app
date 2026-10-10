import { AnimatePresence } from "motion/react";
import { Suspense, useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";

import { preloadPages, routeConfig } from "./config";

export function AppRouter() {
    const location = useLocation();

    useEffect(() => {
        preloadPages();
    }, []);

    // fallback не нужен: шапка общая и стоит на месте, а котик показывается в самих страницах
    return (
        <Suspense fallback={null}>
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
