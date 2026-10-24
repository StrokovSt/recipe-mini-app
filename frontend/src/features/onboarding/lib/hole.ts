import type { CSSProperties } from "react";

// Окошко в затемнении вокруг подсвеченной кнопки.
// type, а не interface: motion принимает его как цель анимации
export type Hole = {
    left: number;
    top: number;
    width: number;
    height: number;
    borderRadius: number;
};

// Отступ подсветки от кнопки
const readHolePadding = () =>
    parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--size-onboarding-hole-padding")) || 0;

// Подсветка вокруг кнопки с тем же скруглением. Без кнопки — точка в центре экрана: затемнено всё.
// null — кнопки на странице пока нет
export const getHole = (target?: string): Hole | null => {
    if (!target) {
        return { left: window.innerWidth / 2, top: window.innerHeight / 2, width: 0, height: 0, borderRadius: 0 };
    }

    const element = document.querySelector<HTMLElement>(`[data-onboarding="${target}"]`);
    if (!element) return null;

    const rect = element.getBoundingClientRect();
    const padding = readHolePadding();
    const radius = getComputedStyle(element).borderRadius;
    const borderRadius = radius.endsWith("%") ? Math.min(rect.width, rect.height) / 2 : parseFloat(radius) || 0;

    return {
        left: Math.round(rect.left - padding),
        top: Math.round(rect.top - padding),
        width: Math.round(rect.width + 2 * padding),
        height: Math.round(rect.height + 2 * padding),
        borderRadius: borderRadius + padding,
    };
};

export const isSameHole = (a: Hole | null, b: Hole | null) =>
    a === b
    || (a !== null && b !== null && a.left === b.left && a.top === b.top && a.width === b.width && a.height === b.height);

// Подсказка под кнопкой, если та в верхней половине экрана, иначе над ней
export const getCardStyle = (hole: Hole): CSSProperties => {
    if (hole.top + hole.height / 2 < window.innerHeight / 2) {
        return { top: `calc(${hole.top + hole.height}px + var(--space-3))` };
    }
    return { bottom: `calc(${window.innerHeight - hole.top}px + var(--space-3))` };
};
