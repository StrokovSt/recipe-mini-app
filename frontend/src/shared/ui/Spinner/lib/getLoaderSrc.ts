import { type LoaderName, LOADERS } from "../config/loaders";

// Safari и все браузеры на iPhone и iPad (движок Apple): им HEVC, остальным WebM.
// HEVC с прозрачностью другие браузеры не умеют, даже если играют HEVC
const isApple = navigator.vendor.startsWith("Apple");

export const getLoaderSrc = (name: LoaderName) => (isApple ? LOADERS[name].hevc : LOADERS[name].webm);
