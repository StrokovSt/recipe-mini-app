import { type ComponentType, lazy } from "react";

type ComponentModule<P> = { default: ComponentType<P> };

// lazy с фоновой подгрузкой. Если код уже загружен, lazy получает его синхронно
// и React не показывает пустой Suspense (~300мс) при первом показе компонента.
// subscribe и isLoaded — чтобы узнать, когда код загрузился (для useSyncExternalStore)
export const lazyWithPreload = <P extends object>(load: () => Promise<ComponentModule<P>>) => {
    let loaded: ComponentModule<P> | undefined;
    const listeners = new Set<() => void>();

    const preload = () => load().then((module) => {
        loaded = module;
        listeners.forEach((listener) => listener());
        return module;
    });
    const syncModule = (module: ComponentModule<P>) => ({ then: (resolve: (value: ComponentModule<P>) => void) => resolve(module) });
    const Component = lazy(() => (loaded ? syncModule(loaded) : preload()) as Promise<ComponentModule<P>>);

    const subscribe = (listener: () => void) => {
        listeners.add(listener);
        return () => listeners.delete(listener);
    };
    const isLoaded = () => loaded !== undefined;

    return { Component, preload, subscribe, isLoaded };
};
