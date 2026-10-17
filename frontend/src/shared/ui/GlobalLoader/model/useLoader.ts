import { useEffect, useRef, useSyncExternalStore } from "react";

import { finishLoading, getLoaderState, handOffLoading, type LoaderOptions, startLoading, subscribeLoader } from "./loaderStore";

interface UseLoaderOptions extends LoaderOptions {
    // Если страница уходит, не дождавшись конца загрузки, котик остаётся до отрисовки следующей.
    // Например, распознавание рецепта: после него открывается форма
    handOff?: boolean;
}

// Котик на экране или ещё гаснет: PageWrapper до этого держит контент скрытым
export function useIsLoaderShown() {
    const { isVisible, isLeaving } = useSyncExternalStore(subscribeLoader, getLoaderState);
    return isVisible || isLeaving;
}

// Показывает глобального котика, пока isLoading
export function useLoader(isLoading: boolean, options: UseLoaderOptions = {}) {
    const { label, delay, loader, handOff = false } = options;
    const idRef = useRef<number | null>(null);

    useEffect(() => {
        if (idRef.current !== null) {
            finishLoading(idRef.current);
            idRef.current = null;
        }

        if (isLoading) idRef.current = startLoading({ label, delay, loader });
    }, [isLoading, label, delay, loader]);

    useEffect(() => () => {
        const id = idRef.current;
        if (id === null) return;

        if (handOff) handOffLoading(id);
        else finishLoading(id);
        idRef.current = null;
    }, [handOff]);
}
