import { ANIMATIONS_STORAGE_KEY, applyAnimations } from "./setAnimations";

// Сохранённый выбор важнее системной настройки «Уменьшить движение»
export function initAnimations() {
    const saved = localStorage.getItem(ANIMATIONS_STORAGE_KEY);
    const isEnabled = saved ? saved === "on" : !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    applyAnimations(isEnabled);
}
