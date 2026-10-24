import { lazyWhenOpen } from "@/shared/lib/lazy";

// Код шторки вместе с headlessui (~21 КБ gzip) для первой отрисовки не нужен: шторки на старте закрыты.
// Качается при первом открытии или заранее, после первого действия человека (app/router/preloadOnFirstAction)
export const { Component: BottomSheet, preload: preloadBottomSheet } = lazyWhenOpen(() =>
    import("./BottomSheet").then((module) => module.BottomSheet),
);
