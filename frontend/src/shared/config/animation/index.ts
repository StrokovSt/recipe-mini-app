import type { Transition } from "motion/react";

export const TRANSITION_BASE: Transition = {
    duration: 0.3,
    ease: [0.4, 0, 0.2, 1],
};

export const TRANSITION_PAGE: Transition = {
    duration: 0.2,
    ease: [0.4, 0, 0.2, 1],
};
