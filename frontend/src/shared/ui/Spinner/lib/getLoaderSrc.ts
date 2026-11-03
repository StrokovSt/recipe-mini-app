import { type LoaderName, LOADERS } from "../config/loaders";

// Safari и все браузеры на iPhone и iPad (движок Apple): им HEVC, остальным WebM.
// HEVC с прозрачностью другие браузеры не умеют, даже если играют HEVC
export const isApple = navigator.vendor.startsWith("Apple");

// Уже скачанные котики (ссылки blob: на файлы в памяти). Из памяти котик виден сразу,
// даже если HTTP-кэш выключен (DevTools) или видео ещё качалось вторым запросом
const loaded: { [Name in LoaderName]?: { src?: string; poster?: string } } = {};

export const setLoaded = (name: LoaderName, file: "src" | "poster", url: string) => {
    loaded[name] = { ...loaded[name], [file]: url };
};

export const getVideoUrl = (name: LoaderName) => (isApple ? LOADERS[name].hevc : LOADERS[name].webm);

export const getLoaderSrc = (name: LoaderName) => loaded[name]?.src ?? getVideoUrl(name);

export const getLoaderPoster = (name: LoaderName) => loaded[name]?.poster ?? LOADERS[name].poster;
