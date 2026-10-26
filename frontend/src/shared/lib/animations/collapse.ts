import { flushSync } from "react-dom";

import { EASING_BASE } from "@/shared/config/animation";

import { getAnimations } from "./setAnimations";

const FADE_MS = 150;
const COLLAPSE_MS = 250;

// Место элемента в списке: высота, внутренние отступы, рамка и поля, а в конце ещё отступ до соседа (gap родителя).
// Первый кадр каждого свойства — «места нет», второй — как сейчас
const getSpaceKeyframes = (element: HTMLElement): PropertyIndexedKeyframes => {
    const style = getComputedStyle(element);
    const parent = element.parentElement;
    const gap = parent && parent.children.length > 1 ? parseFloat(getComputedStyle(parent).rowGap) || 0 : 0;

    return {
        overflow: ["hidden", "hidden"],
        height: ["0px", style.height],
        paddingTop: ["0px", style.paddingTop],
        paddingBottom: ["0px", style.paddingBottom],
        borderTopWidth: ["0px", style.borderTopWidth],
        borderBottomWidth: ["0px", style.borderBottomWidth],
        marginTop: ["0px", style.marginTop],
        marginBottom: [`${-gap}px`, style.marginBottom],
    };
};

// Плавно убирает элемент списка: сначала он тает, потом сжимается его место вместе с отступом до соседа,
// и соседи подтягиваются без рывка. Затем remove удаляет его из данных, а flushSync сразу убирает его
// со страницы. Если элемент всё же остался (его успели вернуть), анимация снимается и он снова виден
export const collapseAndRemove = async (element: HTMLElement, remove: () => void) => {
    const options: KeyframeAnimationOptions = { easing: EASING_BASE, fill: "forwards" };
    const isAnimated = getAnimations();

    const fade = element.animate({ opacity: [1, 0] }, { ...options, duration: isAnimated ? FADE_MS : 0 });
    await fade.finished;

    const shrink = element.animate(getSpaceKeyframes(element), {
        ...options,
        duration: isAnimated ? COLLAPSE_MS : 0,
        direction: "reverse",
    });
    await shrink.finished;

    flushSync(remove);
    fade.cancel();
    shrink.cancel();
};

// Обратное collapseAndRemove: insert добавляет элемент в данные, flushSync сразу показывает его,
// потом его место плавно раскрывается, и элемент проявляется. getElement находит его на странице
export const insertAndExpand = (insert: () => void, getElement: () => Element | null | undefined) => {
    flushSync(insert);

    const element = getElement();
    if (!(element instanceof HTMLElement) || !getAnimations()) return;

    element.animate(getSpaceKeyframes(element), { duration: COLLAPSE_MS, easing: EASING_BASE });
    element.animate(
        { opacity: [0, 1] },
        { duration: FADE_MS, delay: COLLAPSE_MS, easing: EASING_BASE, fill: "backwards" },
    );
};
