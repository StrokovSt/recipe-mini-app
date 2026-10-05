import WebApp from "@twa-dev/sdk";
import { useEffect, useState } from "react";

import { IconButton } from "@/shared/ui/Buttons";

import styles from "./Header.module.scss";

export function Header() {
    const [isDark, setIsDark] = useState(false);

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
            <IconButton className={styles.burger} icon="burger" variant="empty" />
            <div className={styles.heading}>
                <h2>Ричетта</h2>
            </div>
            <button className={styles.themeBtn} onClick={toggleTheme} aria-label="Сменить тему">
                {isDark ? "☀️" : "🌙"}
            </button>
        </header>
    );
}