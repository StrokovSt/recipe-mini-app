import type { Transition } from "motion/react";

// Карточки способов и черновики выезжают снизу по очереди, на пружине
export const RISE_HIDDEN = { opacity: 0, y: 24 };
export const RISE_VISIBLE = { opacity: 1, y: 0 };

const STAGGER = 0.08;

export const getRiseTransition = (index: number): Transition => ({
    type: "spring",
    stiffness: 260,
    damping: 24,
    delay: 0.1 + index * STAGGER,
});
