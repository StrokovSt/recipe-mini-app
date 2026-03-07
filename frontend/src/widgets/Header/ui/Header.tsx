import WebApp from "@twa-dev/sdk";
import { useEffect, useState } from "react";

import { getGreeting } from "@/shared/lib/utils";

import styles from "./Header.module.scss";

export function Header() {
    const [isDark, setIsDark] = useState(false);
    const user = WebApp.initDataUnsafe?.user;
    const name = user?.first_name ?? "Гость";

    useEffect(() => {
        const saved = localStorage.getItem("theme");
        const prefersDark = saved === "dark" || WebApp.colorScheme === "dark";
        setIsDark(prefersDark);
        document.documentElement.setAttribute("data-theme", prefersDark ? "dark" : "light");
    }, []);

    const toggleTheme = () => {
        const next = !isDark;
        setIsDark(next);
        const theme = next ? "dark" : "light";
        document.documentElement.setAttribute("data-theme", theme);
        localStorage.setItem("theme", theme);
    };

    return (
        <header className={styles.header}>
        <div>
            <p className={styles.greeting}>{getGreeting()}</p>
            <h1 className={styles.name}>{name}</h1>
        </div>
        <button className={styles.themeBtn} onClick={toggleTheme} aria-label="Сменить тему">
            {isDark ? "☀️" : "🌙"}
        </button>
        </header>
    );
}