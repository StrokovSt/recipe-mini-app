import { useState } from "react";
import { useTranslation } from "react-i18next";

import { IconButton } from "@/shared/ui/Buttons";

import { AppMenu } from "./AppMenu";

import styles from "./AppMenuButton.module.scss";

interface AppMenuButtonProps {
    disabled?: boolean;
}

// Бургер в шапке страницы, открывает меню приложения
export function AppMenuButton(props: AppMenuButtonProps) {
    const { disabled } = props;
    const { t } = useTranslation("menu");
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <>
            <IconButton
                icon="burger"
                round
                type="button"
                className={styles.button}
                aria-label={t("open")}
                aria-expanded={isMenuOpen}
                onClick={() => setIsMenuOpen(true)}
                disabled={disabled}
            />
            <AppMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
        </>
    );
}
