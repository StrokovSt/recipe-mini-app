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

// Цвет строки состояния в установленном приложении (PWA) под фон текущей темы
export function syncThemeColor() {
    const color = getComputedStyle(document.documentElement).getPropertyValue("--color-app-bg").trim();
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", color);
}

export function setTheme(theme: Theme) {
    const apply = () => {
        document.documentElement.setAttribute("data-theme", theme);
        syncThemeColor();
    };

    localStorage.setItem(THEME_STORAGE_KEY, theme);

    if ("startViewTransition" in document && getAnimations()) {
        document.startViewTransition(apply);
    } else {
        apply();
    }
}
