import { isSplashShown } from "@/shared/lib/splash";

import { DEFAULT_LOADER, type LoaderName, LOADERS } from "../config/loaders";
import { getLoaderSrc } from "./getLoaderSrc";

// Медленная сеть не держит запуск дольше этого
const MAX_WAIT_MS = 1000;

// Котик нужен уже при первой загрузке, а видео приходит позже страницы.
// Видео начинаем качать сразу, а лёгкий постер (первый кадр) ждём:
// пока видео в пути, вместо него виден неподвижный котик.
// Обычный котик грузится при старте, остальные там, где понадобятся
export function preloadLoader(name: LoaderName = DEFAULT_LOADER): Promise<unknown> {
    const { poster } = LOADERS[name];
    // Пока видна заставка, это же видео качает она сама: второй запрос шёл бы параллельно и скачал файл ещё раз
    if (!isSplashShown()) fetch(getLoaderSrc(name)).catch(() => undefined);

    const image = new Image();
    image.src = poster;
    const timeout = new Promise((resolve) => setTimeout(resolve, MAX_WAIT_MS));

    return Promise.race([image.decode().catch(() => undefined), timeout]);
}
