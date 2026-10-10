import { MotionGlobalConfig } from "motion/react";

export const ANIMATIONS_STORAGE_KEY = "animations";

export function getAnimations(): boolean {
    return document.documentElement.getAttribute("data-animations") !== "off";
}

export function setAnimations(enabled: boolean) {
    localStorage.setItem(ANIMATIONS_STORAGE_KEY, enabled ? "on" : "off");
    applyAnimations(enabled);
}

// CSS-переходы гасит правило :root[data-animations="off"] в index.scss,
// анимации motion (страницы, шторка, плашки) завершаются мгновенно через skipAnimations
export function applyAnimations(enabled: boolean) {
    document.documentElement.setAttribute("data-animations", enabled ? "on" : "off");
    MotionGlobalConfig.skipAnimations = !enabled;
}
