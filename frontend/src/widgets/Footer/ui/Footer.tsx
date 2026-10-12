import clsx from "clsx";
import { motion } from "motion/react";
import { type ReactNode, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { matchPath, NavLink, useLocation } from "react-router-dom";

import { AppRoute } from "@/app/router";
import AddIcon from "@/shared/assets/icons/icon-add.svg?react";
import CollectionIcon from "@/shared/assets/icons/icon-collection.svg?react";
import SectionsIcon from "@/shared/assets/icons/icon-sections.svg?react";
import { TRANSITION_PAGE } from "@/shared/config/animation";
import { getAnimations } from "@/shared/lib/animations";

import styles from "./Footer.module.scss";

// На формах рецепта футера нет: внизу закреплена кнопка сохранения
const HIDDEN_ON: AppRoute[] = [AppRoute.CreateRecipe, AppRoute.Draft, AppRoute.ImportRecipe, AppRoute.EditRecipe];

// Адрес меняется раньше, чем старая страница доиграет уход. Футер появляется после него,
// иначе он выскакивает поверх уходящей формы и поднимает её кнопку сохранения. Убирается сразу
const PAGE_EXIT_MS = (TRANSITION_PAGE.duration ?? 0) * 1000;

interface NavItem {
    to: AppRoute;
    icon: ReactNode;
    label: string;
    isAdd?: boolean;
}

export function Footer() {
    const { t } = useTranslation("footer");
    const { pathname } = useLocation();

    const isHidden = HIDDEN_ON.some((path) => matchPath(path, pathname));
    const [isReady, setIsReady] = useState(!isHidden);

    useEffect(() => {
        if (isHidden) {
            setIsReady(false);
            return;
        }

        const timer = setTimeout(() => setIsReady(true), getAnimations() ? PAGE_EXIT_MS : 0);
        return () => clearTimeout(timer);
    }, [isHidden]);

    if (isHidden || !isReady) return null;

    const navItems: NavItem[] = [
        { to: AppRoute.Home, icon: <CollectionIcon />, label: t("collection") },
        { to: AppRoute.AddRecipe, icon: <AddIcon />, label: "", isAdd: true },
        { to: AppRoute.Sections, icon: <SectionsIcon />, label: t("sections") },
    ];

    return (
        <motion.footer
            className={styles.footer}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={TRANSITION_PAGE}
        >
            <nav className={styles.nav}>
                {navItems.map((item) =>
                    item.isAdd ? (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={({ isActive }) =>
                                clsx(styles.navBtnAdd, isActive && styles.navBtnAddActive)
                            }
                        >
                            {item.icon}
                        </NavLink>
                    ) : (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={({ isActive }) =>
                                clsx(styles.navBtn, isActive && styles.navBtnActive)
                            }
                        >
                            <span className={styles.navIcon}>{item.icon}</span>
                            <span className={styles.navLabel}>{item.label}</span>
                        </NavLink>
                    )
                )}
            </nav>
        </motion.footer>
    );
}