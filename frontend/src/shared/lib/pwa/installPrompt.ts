import WebApp from "@twa-dev/sdk";
import { useSyncExternalStore } from "react";

// Событие Chrome, Edge и Android: с ним можно показать системное окно установки по своей кнопке
interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
}

// Как установить: системное окно браузера, подсказка для iPhone (там окна нет) или никак
export type InstallMode = "prompt" | "ios" | null;

let deferredPrompt: BeforeInstallPromptEvent | null = null;
const listeners = new Set<() => void>();

const notify = () => listeners.forEach((listener) => listener());

const isStandalone = () =>
    matchMedia("(display-mode: standalone)").matches || ("standalone" in navigator && navigator.standalone === true);

// iPad с iPadOS 13+ представляется Mac, отличаем по сенсорному экрану
const isIos = () =>
    /iPhone|iPad|iPod/.test(navigator.userAgent) || (/Macintosh/.test(navigator.userAgent) && navigator.maxTouchPoints > 1);

// Внутри Telegram и в уже установленном приложении кнопка не нужна
const getInstallMode = (): InstallMode => {
    if (WebApp.initData || isStandalone()) return null;
    if (deferredPrompt) return "prompt";
    return isIos() ? "ios" : null;
};

const subscribe = (listener: () => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
};

// Браузер присылает событие один раз и рано, ещё до открытия меню, поэтому ловим его при старте
export const initInstallPrompt = () => {
    window.addEventListener("beforeinstallprompt", (event) => {
        // Вместо плашки браузера установка по кнопке в меню
        event.preventDefault();
        deferredPrompt = event as BeforeInstallPromptEvent;
        notify();
    });
    window.addEventListener("appinstalled", () => {
        deferredPrompt = null;
        notify();
    });
};

// Окно установки показывается один раз на событие: после ответа ждём следующего от браузера
export const promptInstall = async () => {
    const event = deferredPrompt;
    if (!event) return;

    deferredPrompt = null;
    notify();
    await event.prompt();
};

export const useInstallMode = () => useSyncExternalStore(subscribe, getInstallMode);
