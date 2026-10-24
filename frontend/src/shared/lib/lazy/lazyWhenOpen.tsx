import { type ComponentType, Suspense, useSyncExternalStore } from "react";

import { lazyWithPreload } from "./lazyWithPreload";

// Окно (шторка, модалка), чей код не нужен для первой отрисовки страницы: на старте окна закрыты.
// Код качается заранее через preload и, как только загрузился, окно монтируется закрытым,
// поэтому открытие идёт как обычно, с анимацией. Если открыли раньше, чем код загрузился, ждём его в Suspense
export const lazyWhenOpen = <P extends { isOpen: boolean }>(load: () => Promise<ComponentType<P>>) => {
    const { Component, preload, subscribe, isLoaded } = lazyWithPreload(() =>
        load().then((component) => ({ default: component })),
    );

    const LazyWhenOpen = (props: P) => {
        const isCodeLoaded = useSyncExternalStore(subscribe, isLoaded);
        if (!isCodeLoaded && !props.isOpen) return null;

        return (
            <Suspense fallback={null}>
                <Component {...props} />
            </Suspense>
        );
    };

    return { Component: LazyWhenOpen, preload };
};
