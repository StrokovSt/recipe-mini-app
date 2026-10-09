import { useState } from "react";

import { IconButton } from "@/shared/ui/Buttons";

import { AppMenu } from "./AppMenu";

import styles from "./AppMenuButton.module.scss";

// Бургер в шапке страницы, открывает меню приложения
export function AppMenuButton() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <>
            <IconButton
                icon="burger"
                round
                type="button"
                className={styles.button}
                aria-label="Меню"
                aria-expanded={isMenuOpen}
                onClick={() => setIsMenuOpen(true)}
            />
            <AppMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
        </>
    );
}
