import React from "react";

export const useOnClickOutside = (ref: React.RefObject<HTMLElement | null>, handler: () => void) => {
    React.useEffect(() => {
        const onClickOutside = (event: MouseEvent) => {
            if (ref.current && !event.composedPath().includes(ref.current)) {
                handler();
            }
        };

        document.body.addEventListener("click", onClickOutside);
        return () => document.body.removeEventListener("click", onClickOutside);
    });
};