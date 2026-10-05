import clsx from "clsx";
import { NavLink } from "react-router-dom";

import { AppRoute } from "@/app/router";
import AddIcon from "@/shared/assets/icons/icon-add.svg?react";
import HomeIcon from "@/shared/assets/icons/icon-back.svg?react";
import SettingsIcon from "@/shared/assets/icons/icon-forward.svg?react";

import styles from "./Footer.module.scss";

interface NavItem {
    to: AppRoute;
    icon: React.ReactNode;
    label: string;
    isAdd?: boolean;
}

const NAV_ITEMS: NavItem[] = [
    { to: AppRoute.Home, icon: <HomeIcon />, label: "Главная" },
    { to: AppRoute.AddRecipe, icon: <AddIcon />, label: "", isAdd: true },
    { to: AppRoute.Settings, icon: <SettingsIcon />, label: "Настройки" },
];

export function Footer() {
    return (
        <footer className={styles.footer}>
            {NAV_ITEMS.map((item) =>
                item.isAdd ? (
                    <NavLink key={item.to} to={item.to} className={styles.navBtnAdd}>
                        {item.icon}
                    </NavLink>
                ) : 
                (
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
        </footer>
    );
}