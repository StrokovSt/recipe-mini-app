import { splashHidden } from "@/shared/lib/splash";

import { DEFAULT_LOADER, type LoaderName, LOADERS } from "../config/loaders";
import { getVideoUrl, isApple, setLoaded } from "./getLoaderSrc";

// Медленная сеть не держит запуск дольше этого
const MAX_WAIT_MS = 1000;

// Каждый котик качается один раз, сколько бы мест его ни просили
const preloads: { [Name in LoaderName]?: Promise<unknown> } = {};

// Файл целиком в память: дальше video и постер берут его оттуда, без нового запроса
const download = (url: string) =>
    fetch(url)
        .then((response) => (response.ok ? response.blob() : Promise.reject(new Error(url))))
        .then((blob) => URL.createObjectURL(blob));

// Safari играет видео кусками (Range-запросы) и с blob: капризен: ему обычная ссылка, её подхватит HTTP-кэш
const preloadVideo = async (name: LoaderName) => {
    const url = getVideoUrl(name);
    if (isApple) await fetch(url);
    else setLoaded(name, "src", await download(url));
};

const startPreload = (name: LoaderName) => {
    const poster = download(LOADERS[name].poster).then((url) => {
        setLoaded(name, "poster", url);
        const image = new Image();
        image.src = url;
        return image.decode();
    });

    // Видео после постера: на медленной сети они не делят её, и неподвижный котик виден раньше
    Promise.all([poster.catch(() => undefined), splashHidden])
        .then(() => preloadVideo(name))
        .catch(() => undefined);

    return poster.catch(() => undefined);
};

// Котик нужен уже при первой загрузке, а видео приходит позже страницы.
// Сначала качаем лёгкий постер (первый кадр) и ждём его, следом видео:
// пока видео в пути, вместо него виден неподвижный котик.
// Обычный котик грузится при старте, с лупой — как только показана первая страница
export function preloadLoader(name: LoaderName = DEFAULT_LOADER): Promise<unknown> {
    preloads[name] ??= startPreload(name);
    const timeout = new Promise((resolve) => setTimeout(resolve, MAX_WAIT_MS));

    return Promise.race([preloads[name], timeout]);
}
