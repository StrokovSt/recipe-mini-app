import type { FeatureBundle } from "motion/react";

let features: Promise<FeatureBundle> | undefined;

// Движок анимаций motion (~19 КБ gzip) вынесен из основного файла и качается отдельно (MotionProvider).
// main.tsx запускает загрузку до отрисовки, вместе со шрифтами и словарями: тогда появление первой страницы
// его не ждёт, а основной файл меньше и быстрее начинает работу
export const loadMotionFeatures = () => (features ??= import("./motionFeatures").then((module) => module.default));
