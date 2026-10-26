import { flushSync } from "react-dom";

import { EASING_BASE } from "@/shared/config/animation";

import { getAnimations } from "./setAnimations";

const FADE_MS = 150;
const COLLAPSE_MS = 250;

// Плавно убирает элемент списка: сначала он тает, потом сжимается его место вместе с отступом до соседа
// (gap родителя), и соседи подтягиваются без рывка. Затем remove удаляет его из данных, а flushSync сразу
// убирает его со страницы. Если элемент всё же остался (его успели вернуть), анимация снимается и он снова виден
export const collapseAndRemove = async (element: HTMLElement, remove: () => void) => {
    const options: KeyframeAnimationOptions = { easing: EASING_BASE, fill: "forwards" };
    const isAnimated = getAnimations();

    const fade = element.animate({ opacity: [1, 0] }, { ...options, duration: isAnimated ? FADE_MS : 0 });
    await fade.finished;

    const style = getComputedStyle(element);
    const parent = element.parentElement;
    const gap = parent && parent.children.length > 1 ? parseFloat(getComputedStyle(parent).rowGap) || 0 : 0;
    const shrink = element.animate(
        {
            overflow: ["hidden", "hidden"],
            height: [style.height, "0px"],
            paddingTop: [style.paddingTop, "0px"],
            paddingBottom: [style.paddingBottom, "0px"],
            borderTopWidth: [style.borderTopWidth, "0px"],
            borderBottomWidth: [style.borderBottomWidth, "0px"],
            marginTop: [style.marginTop, "0px"],
            marginBottom: [style.marginBottom, `${-gap}px`],
        },
        { ...options, duration: isAnimated ? COLLAPSE_MS : 0 },
    );
    await shrink.finished;

    flushSync(remove);
    fade.cancel();
    shrink.cancel();
};
