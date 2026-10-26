import type { Transition } from "motion/react";

export const TRANSITION_BASE: Transition = {
    duration: 0.3,
    ease: [0.4, 0, 0.2, 1],
};

// Кривая TRANSITION_BASE в виде для Web Animations API (element.animate)
export const EASING_BASE = "cubic-bezier(0.4, 0, 0.2, 1)";

export const TRANSITION_PAGE: Transition = {
    duration: 0.2,
    ease: [0.4, 0, 0.2, 1],
};
