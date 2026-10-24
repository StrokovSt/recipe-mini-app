import { getAnimations } from "@/shared/lib/animations";

// Заставка с котиком из index.html. Висит, пока первая страница не показана целиком
// (словари, шрифты, данные, картинки), и не дольше MAX_SPLASH_MS, если что-то зависло
const MAX_SPLASH_MS = 15000;

const getSplash = () => document.getElementById("splash");

let resolveSplashHidden: () => void = () => {};

// Заставка ушла: дальше загрузки показывает обычный котик (GlobalLoader)
export const splashHidden = new Promise<void>((resolve) => {
    resolveSplashHidden = resolve;
});

export const isSplashShown = () => getSplash() !== null;

// Котик оживает: видео начинает качаться здесь же, пока оно в пути, виден первый кадр (постер)
export function startSplash() {
    if (!getAnimations()) return;
    getSplash()?.querySelector("video")?.play().catch(() => undefined);
}

export function hideSplash() {
    const splash = getSplash();
    resolveSplashHidden();
    if (!splash) return;

    if (!getAnimations()) {
        splash.remove();
        return;
    }
    splash.addEventListener("transitionend", () => splash.remove(), { once: true });
    splash.classList.add("hidden");
}

export function hideSplashWhen(ready: Promise<unknown>) {
    const timeout = new Promise((resolve) => setTimeout(resolve, MAX_SPLASH_MS));
    Promise.race([ready, timeout]).then(hideSplash);
}
