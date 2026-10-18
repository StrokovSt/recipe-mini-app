import clsx from "clsx";
import { AnimatePresence, motion } from "motion/react";
import { type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { matchPath, NavLink, useLocation } from "react-router-dom";

import { AppRoute } from "@/app/router";
import AddIcon from "@/shared/assets/icons/icon-add.svg?react";
import CollectionIcon from "@/shared/assets/icons/icon-collection.svg?react";
import SectionsIcon from "@/shared/assets/icons/icon-sections.svg?react";
import { TRANSITION_PAGE } from "@/shared/config/animation";
import { useSetPageFooterSlot } from "@/shared/ui/PageFooter";

import styles from "./Footer.module.scss";

// На формах вместо навигации в плашке кнопка страницы (сохранить, распознать), её кладёт PageFooter
const ACTION_ON: AppRoute[] = [AppRoute.CreateRecipe, AppRoute.Draft, AppRoute.ImportRecipe, AppRoute.EditRecipe];

const HIDDEN = { opacity: 0 };
const VISIBLE = { opacity: 1 };

interface NavItem {
    to: AppRoute;
    icon: ReactNode;
    label: string;
    isAdd?: boolean;
}

export function Footer() {
    const { t } = useTranslation("footer");
    const { pathname } = useLocation();
    const setSlot = useSetPageFooterSlot();

    const hasAction = ACTION_ON.some((path) => matchPath(path, pathname));

    const navItems: NavItem[] = [
        { to: AppRoute.Home, icon: <CollectionIcon />, label: t("collection") },
        { to: AppRoute.AddRecipe, icon: <AddIcon />, label: t("add"), isAdd: true },
        { to: AppRoute.Sections, icon: <SectionsIcon />, label: t("sections") },
    ];

    return (
        <motion.footer className={styles.footer} initial={HIDDEN} animate={VISIBLE} transition={TRANSITION_PAGE}>
            {/* Плашка стоит на месте, навигация и кнопка формы сменяют друг друга внутри */}
            <div className={clsx(styles.nav, hasAction && styles.navAction)}>
                <AnimatePresence mode="wait" initial={false}>
                    {hasAction ? (
                        <motion.div
                            key="action"
                            ref={setSlot}
                            className={styles.action}
                            initial={HIDDEN}
                            animate={VISIBLE}
                            exit={HIDDEN}
                            transition={TRANSITION_PAGE}
                        />
                    ) : (
                        <motion.nav
                            key="nav"
                            className={styles.items}
                            initial={HIDDEN}
                            animate={VISIBLE}
                            exit={HIDDEN}
                            transition={TRANSITION_PAGE}
                        >
                            {navItems.map((item) =>
                                item.isAdd ? (
                                    <NavLink
                                        key={item.to}
                                        to={item.to}
                                        aria-label={item.label}
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
                        </motion.nav>
                    )}
                </AnimatePresence>
            </div>
        </motion.footer>
    );
}
