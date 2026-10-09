export type Theme = "light" | "dark";

export const THEME_STORAGE_KEY = "theme";

export function getTheme(): Theme {
    return document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
}

export function setTheme(theme: Theme) {
    const apply = () => document.documentElement.setAttribute("data-theme", theme);

    localStorage.setItem(THEME_STORAGE_KEY, theme);

    if ("startViewTransition" in document) {
        document.startViewTransition(apply);
    } else {
        apply();
    }
}
