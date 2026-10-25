import { getAnimations } from "@/shared/lib/animations";

// Заставка с печатью из index.html. Висит, пока первая страница не показана целиком
// (словари, шрифты, данные, картинки), и не дольше MAX_SPLASH_MS, если что-то зависло
const MAX_SPLASH_MS = 15000;

const getSplash = () => document.getElementById("splash");

let resolveSplashHidden: () => void = () => {};

// Заставка ушла: дальше загрузки показывает котик (GlobalLoader)
export const splashHidden = new Promise<void>((resolve) => {
    resolveSplashHidden = resolve;
});

export const isSplashShown = () => getSplash() !== null;

const removeSplash = (splash: HTMLElement) => {
    splash.remove();
    resolveSplashHidden();
};

// Уход начинается, когда печать встала: при быстрой загрузке её появление не обрывается на середине.
// Печать ещё не загрузилась (анимации нет): уходим сразу
export function hideSplash() {
    const splash = getSplash();
    if (!splash) {
        resolveSplashHidden();
        return;
    }

    if (!getAnimations()) {
        removeSplash(splash);
        return;
    }

    const stamping = splash.querySelector("img")?.getAnimations() ?? [];
    Promise.all(stamping.map((animation) => animation.finished)).catch(() => undefined).then(() => {
        // Своя анимация заставки (окно на главную) кончается последней, анимации печати внутри всплывают сюда же
        splash.addEventListener("animationend", (event) => {
            if (event.target === splash) removeSplash(splash);
        });
        splash.classList.add("out");
    });
}

export function hideSplashWhen(ready: Promise<unknown>) {
    const timeout = new Promise((resolve) => setTimeout(resolve, MAX_SPLASH_MS));
    Promise.race([ready, timeout]).then(hideSplash);
}
