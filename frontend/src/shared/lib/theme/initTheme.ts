import WebApp from "@twa-dev/sdk";

import { THEME_STORAGE_KEY } from "./setTheme";

export function initTheme() {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    const isDark = saved ? saved === "dark" : WebApp.colorScheme === "dark";

    document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");
}
