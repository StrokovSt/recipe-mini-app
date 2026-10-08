import clsx from "clsx";
import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";

import { AppRoute } from "@/app/router";
import AddIcon from "@/shared/assets/icons/icon-add.svg?react";
import CollectionIcon from "@/shared/assets/icons/icon-collection.svg?react";
import SectionsIcon from "@/shared/assets/icons/icon-sections.svg?react";

import styles from "./Footer.module.scss";

interface NavItem {
    to: AppRoute;
    icon: ReactNode;
    label: string;
    isAdd?: boolean;
}

const NAV_ITEMS: NavItem[] = [
    { to: AppRoute.Home, icon: <CollectionIcon />, label: "Коллекция" },
    { to: AppRoute.AddRecipe, icon: <AddIcon />, label: "", isAdd: true },
    { to: AppRoute.Sections, icon: <SectionsIcon />, label: "Разделы" },
];

export function Footer() {
    return (
        <footer className={styles.footer}>
            <nav className={styles.nav}>
                {NAV_ITEMS.map((item) =>
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
        </footer>
    );
}