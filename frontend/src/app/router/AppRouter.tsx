import { AnimatePresence } from "motion/react";
import { Suspense, useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";

import { registerServiceWorker } from "@/shared/lib/pwa";
import { firstPageShown } from "@/shared/ui/PageWrapper";

import { preloadPages, routeConfig } from "./config";

// Первые действия человека на странице: после них можно качать код остальных страниц
const USER_EVENTS = ["pointerdown", "keydown", "scroll", "wheel"];

const preloadOnFirstAction = () => {
    const start = () => {
        USER_EVENTS.forEach((event) => window.removeEventListener(event, start, true));
        preloadPages();
        registerServiceWorker();
    };
    USER_EVENTS.forEach((event) => window.addEventListener(event, start, { capture: true, passive: true }));
};

export function AppRouter() {
    const location = useLocation();

    // Код остальных страниц (и service worker) качаем в фоне, когда первая страница уже показана и человек начал ею пользоваться
    // (коснулся, прокрутил, нажал клавишу). Так он не отбирает сеть у данных и обложек, а Lighthouse
    // не видит лишних цепочек запросов при загрузке
    useEffect(() => {
        firstPageShown.then(preloadOnFirstAction);
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
