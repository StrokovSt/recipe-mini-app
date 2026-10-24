import type WebApp from "@twa-dev/sdk";

type Telegram = typeof WebApp;

let telegram: Telegram | null = null;

// Telegram передаёт параметры запуска в адресе (#tgWebAppData=…&tgWebAppVersion=…),
// а SDK сохраняет их в sessionStorage, чтобы они пережили перезагрузку страницы
const isInTelegram = () => /tgWebApp/.test(location.hash + (sessionStorage.getItem("__telegram__initParams") ?? ""));

// SDK Telegram (~13 КБ gzip) нужен только внутри Telegram, на сайте его не качаем.
// Вызывается в main.tsx до отрисовки, поэтому дальше getTelegram отвечает сразу
export const loadTelegram = async () => {
    if (!isInTelegram()) return;
    telegram = (await import("@twa-dev/sdk")).default;
};

// null — приложение открыто не в Telegram
export const getTelegram = () => telegram;
