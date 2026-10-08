import WebApp from "@twa-dev/sdk";

export function initTheme() {
    const saved = localStorage.getItem("theme");
    const isDark = saved === "dark" || WebApp.colorScheme === "dark";

    document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");
}
