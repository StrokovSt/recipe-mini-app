import { flushSync } from "react-dom";

import { EASING_BASE } from "@/shared/config/animation";

import { getAnimations } from "./setAnimations";

const HEIGHT_MS = 300;
const FADE_MS = 200;

// Плавная смена содержимого блока, например вкладки: change меняет его, flushSync сразу показывает новое.
// Блок (element) плавно меняет высоту с прежней на новую, лишнее пока обрезано; новое содержимое (content) проявляется
export const animateContentChange = (element: HTMLElement, content: HTMLElement, change: () => void) => {
    const from = element.offsetHeight;
    flushSync(change);
    if (!getAnimations()) return;

    element.animate(
        { height: [`${from}px`, `${element.offsetHeight}px`], overflow: ["hidden", "hidden"] },
        { duration: HEIGHT_MS, easing: EASING_BASE },
    );
    content.animate({ opacity: [0, 1] }, { duration: FADE_MS, easing: EASING_BASE });
};
