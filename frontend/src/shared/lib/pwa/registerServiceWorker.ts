import { registerSW } from "virtual:pwa-register";

let isRegistered = false;

// Ставит service worker один раз. Новая версия приложения подхватывается тихо:
// страница не перезагружается посреди работы, обновление видно при следующем запуске
export const registerServiceWorker = () => {
    if (isRegistered) return;
    isRegistered = true;
    registerSW({ immediate: true, onNeedReload: () => {} });
};
