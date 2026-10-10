import { type RefObject, useEffect, useState } from "react";

// true, когда элемент целиком ушёл вверх под cover (например, под липкую шапку страницы)
export const useIsHiddenBehind = (
    targetRef: RefObject<HTMLElement | null>,
    cover: HTMLElement | null
) => {
    const [isHidden, setIsHidden] = useState(false);

    useEffect(() => {
        const target = targetRef.current;
        if (!target) return;

        const coverHeight = cover?.offsetHeight ?? 0;
        const observer = new IntersectionObserver(
            ([entry]) => setIsHidden(!entry.isIntersecting && entry.boundingClientRect.top < coverHeight),
            { rootMargin: `-${coverHeight}px 0px 0px 0px` }
        );

        observer.observe(target);

        return () => observer.disconnect();
    }, [targetRef, cover]);

    return isHidden;
};
