import { getAnimations } from "@/shared/lib/animations";

// Заставка с печатью из index.html. Висит, пока первая страница не показана целиком
// (словари, шрифты, данные, картинки), и не дольше MAX_SPLASH_MS, если что-то зависло
const MAX_SPLASH_MS = 15000;
// Сколько ещё ждать картинку печати, если приложение готово раньше неё (медленная сеть, планшет)
const MAX_SEAL_WAIT_MS = 1500;

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

// Печать загрузилась (или не загрузится): тогда у неё уже есть класс in и анимация появления
const waitForSeal = (seal: HTMLImageElement | null) => {
    if (!seal || seal.complete) return Promise.resolve();
    const loaded = new Promise((resolve) => {
        seal.addEventListener("load", resolve, { once: true });
        seal.addEventListener("error", resolve, { once: true });
    });
    const timeout = new Promise((resolve) => setTimeout(resolve, MAX_SEAL_WAIT_MS));
    return Promise.race([loaded, timeout]);
};

// Уход начинается, когда печать встала: при быстрой загрузке её появление не обрывается на середине.
// Приложение готово раньше картинки печати: ждём её, иначе печать выскочила бы сразу во взрыве ухода
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

    const seal = splash.querySelector("img");
    waitForSeal(seal)
        .then(() => Promise.all((seal?.getAnimations() ?? []).map((animation) => animation.finished)))
        .catch(() => undefined)
        .then(() => {
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
