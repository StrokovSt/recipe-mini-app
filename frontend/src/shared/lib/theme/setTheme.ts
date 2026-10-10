import { getAnimations } from "@/shared/lib/animations";

export type Theme = "light" | "dark";

export const THEME_STORAGE_KEY = "theme";

export function getTheme(): Theme {
    return document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
}

// Выбор, сохранённый на устройстве, null — тема берётся из Telegram
export function getSavedTheme(): Theme | null {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    return saved === "light" || saved === "dark" ? saved : null;
}

export function setTheme(theme: Theme) {
    const apply = () => document.documentElement.setAttribute("data-theme", theme);

    localStorage.setItem(THEME_STORAGE_KEY, theme);

    if ("startViewTransition" in document && getAnimations()) {
        document.startViewTransition(apply);
    } else {
        apply();
    }
}
