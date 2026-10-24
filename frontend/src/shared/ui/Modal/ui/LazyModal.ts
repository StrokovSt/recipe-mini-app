import { lazyWhenOpen } from "@/shared/lib/lazy";

// Как и шторка, код окна с headlessui качается при первом открытии или заранее (app/router/preloadOnFirstAction)
export const { Component: Modal, preload: preloadModal } = lazyWhenOpen(() =>
    import("./Modal").then((module) => module.Modal),
);
