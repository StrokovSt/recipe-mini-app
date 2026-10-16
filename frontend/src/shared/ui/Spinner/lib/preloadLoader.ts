import catPoster from "@/shared/assets/images/cat-loader-poster.webp";
import catLoaderWebm from "@/shared/assets/video/cat-loader-480.webm";
import catLoaderMp4 from "@/shared/assets/video/cat-loader-preview.mp4";

// Медленная сеть не держит запуск дольше этого
const MAX_WAIT_MS = 1000;

// Котик нужен уже при первой загрузке, а видео приходит позже страницы.
// Видео начинаем качать сразу при старте, а лёгкий постер (первый кадр) ждём:
// пока видео в пути, вместо него виден неподвижный котик
export function preloadLoader(): Promise<unknown> {
    const canPlayWebm = document.createElement("video").canPlayType("video/webm") !== "";
    fetch(canPlayWebm ? catLoaderWebm : catLoaderMp4).catch(() => undefined);

    const poster = new Image();
    poster.src = catPoster;
    const timeout = new Promise((resolve) => setTimeout(resolve, MAX_WAIT_MS));

    return Promise.race([poster.decode().catch(() => undefined), timeout]);
}
