import { type RefObject, useEffect } from "react";

export const useOnClickOutside = (ref: RefObject<HTMLElement | null>, handler: () => void) => {
    useEffect(() => {
        const onClickOutside = (event: MouseEvent) => {
            if (ref.current && !event.composedPath().includes(ref.current)) {
                handler();
            }
        };

        document.body.addEventListener("click", onClickOutside);
        return () => document.body.removeEventListener("click", onClickOutside);
    });
};