import { useCallback, useEffect, useRef } from "react";

export function useDebouncedCallback<Args extends unknown[]>(
    callback: (...args: Args) => void,
    delay: number,
) {
    const callbackRef = useRef(callback);
    const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

    useEffect(() => {
        callbackRef.current = callback;
    }, [callback]);

    const cancel = useCallback(() => {
        clearTimeout(timerRef.current);
    }, []);

    const run = useCallback((...args: Args) => {
        clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => callbackRef.current(...args), delay);
    }, [delay]);

    useEffect(() => cancel, [cancel]);

    return { run, cancel };
}
