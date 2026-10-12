import { useEffect, useRef } from "react";

import { finishLoading, handOffLoading, type LoaderOptions, startLoading } from "./loaderStore";

interface UseLoaderOptions extends LoaderOptions {
    // Если страница уходит, не дождавшись конца загрузки, котик остаётся до отрисовки следующей.
    // Например, распознавание рецепта: после него открывается форма
    handOff?: boolean;
}

// Показывает глобального котика, пока isLoading
export function useLoader(isLoading: boolean, options: UseLoaderOptions = {}) {
    const { label, delay, handOff = false } = options;
    const idRef = useRef<number | null>(null);

    useEffect(() => {
        if (idRef.current !== null) {
            finishLoading(idRef.current);
            idRef.current = null;
        }

        if (isLoading) idRef.current = startLoading({ label, delay });
    }, [isLoading, label, delay]);

    useEffect(() => () => {
        const id = idRef.current;
        if (id === null) return;

        if (handOff) handOffLoading(id);
        else finishLoading(id);
        idRef.current = null;
    }, [handOff]);
}
