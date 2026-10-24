import { registerServiceWorker } from "@/shared/lib/pwa";
import { preloadBottomSheet } from "@/shared/ui/BottomSheet";
import { preloadModal } from "@/shared/ui/Modal";

import { preloadPages } from "./config";

// Первые действия человека на странице: после них можно качать код остальных страниц
const USER_EVENTS = ["pointerdown", "keydown", "scroll", "wheel"];

// Код остальных страниц, шторок и окон (и service worker) качаем в фоне, когда первая страница уже показана и человек начал ею пользоваться
// (коснулся, прокрутил, нажал клавишу). Так он не отбирает сеть у данных и обложек, а Lighthouse
// не видит лишних цепочек запросов при загрузке. Вызывается из main.tsx после firstPageShown
export const preloadOnFirstAction = () => {
    const start = () => {
        USER_EVENTS.forEach((event) => window.removeEventListener(event, start, true));
        // Шторки первыми: первое действие часто и есть открытие меню или фильтров
        preloadBottomSheet();
        preloadModal();
        preloadPages();
        registerServiceWorker();
    };
    USER_EVENTS.forEach((event) => window.addEventListener(event, start, { capture: true, passive: true }));
};
