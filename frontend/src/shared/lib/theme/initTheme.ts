import { getTelegram } from "@/shared/lib/telegram";

import { syncThemeColor, THEME_STORAGE_KEY } from "./setTheme";

export function initTheme() {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    const isDark = saved ? saved === "dark" : getTelegram()?.colorScheme === "dark";

    document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");
    syncThemeColor();
}
