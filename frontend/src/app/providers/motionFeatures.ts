import { domMax } from "motion/react";

// Отдельный файл, чтобы движок анимаций попал в свой чанк (loadMotionFeatures). domMax, а не domAnimation:
// layout-анимация нужна в ActiveFilters
export default domMax;
