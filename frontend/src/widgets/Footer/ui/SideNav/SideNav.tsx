import clsx from "clsx";
import { m } from "motion/react";
import { type MouseEvent, type ReactNode, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, NavLink, useNavigate } from "react-router-dom";

import { AppRoute } from "@/app/router";
import { startOnboarding } from "@/features/onboarding";
import AddIcon from "@/shared/assets/icons/icon-add.svg?react";
import CollectionIcon from "@/shared/assets/icons/icon-collection.svg?react";
import HelpIcon from "@/shared/assets/icons/icon-help.svg?react";
import InfoIcon from "@/shared/assets/icons/icon-info.svg?react";
import InstallIcon from "@/shared/assets/icons/icon-install.svg?react";
import SectionsIcon from "@/shared/assets/icons/icon-sections.svg?react";
import SettingsIcon from "@/shared/assets/icons/icon-settings.svg?react";
import UserIcon from "@/shared/assets/icons/icon-user.svg?react";
import logo from "@/shared/assets/images/logo.webp";
import logoDark from "@/shared/assets/images/logo-dark.webp";
import seal from "@/shared/assets/images/seal.webp";
import { TRANSITION_PAGE } from "@/shared/config/animation";
import { promptInstall, useInstallMode } from "@/shared/lib/pwa";
import { Modal } from "@/shared/ui/Modal";

import styles from "./SideNav.module.scss";

const HIDDEN = { opacity: 0 };
const VISIBLE = { opacity: 1 };

interface SideNavProps {
    // Узкая рейка на планшете: печать и кнопки-иконки без подписей. Иначе боковая панель с логотипом и подписями
    isRail: boolean;
    onAddClick: (event: MouseEvent<HTMLAnchorElement>) => void;
}

interface SideLink {
    to: AppRoute;
    icon: ReactNode;
    label: string;
    onboarding?: string;
    onClick?: (event: MouseEvent<HTMLAnchorElement>) => void;
}

// Навигация слева на планшете и компьютере. Сверху те же пункты, что в нижней плашке на телефоне,
// снизу пункты меню (на телефоне они в шторке за бургером). Метки data-onboarding те же: обучение находит кнопки здесь.
// Все пункты — кнопки с подсветкой и линией слева у выбранной, «Добавить рецепт» среди них, как «+» в плашке.
// В рейке квадратные иконки без подписей, на компьютере строки с подписями
export function SideNav(props: SideNavProps) {
    const { isRail, onAddClick } = props;
    const { t } = useTranslation(["footer", "common", "menu"]);
    const navigate = useNavigate();
    const installMode = useInstallMode();
    const [isIosHintOpen, setIsIosHintOpen] = useState(false);

    const navLinks: SideLink[] = [
        { to: AppRoute.Home, icon: <CollectionIcon />, label: t("collection"), onboarding: "home" },
        { to: AppRoute.AddRecipe, icon: <AddIcon />, label: t("add"), onboarding: "add", onClick: onAddClick },
        { to: AppRoute.Sections, icon: <SectionsIcon />, label: t("sections"), onboarding: "sections" },
    ];

    const menuLinks: SideLink[] = [
        { to: AppRoute.Profile, icon: <UserIcon />, label: t("menu:profile.title") },
        { to: AppRoute.Settings, icon: <SettingsIcon />, label: t("menu:settings.title") },
        { to: AppRoute.About, icon: <InfoIcon />, label: t("menu:about.title") },
    ];

    // Обучение идёт на главной: переходим туда и запускаем заново
    const handleHelp = () => {
        navigate(AppRoute.Home);
        startOnboarding();
    };

    // На iPhone нет системного окна установки: показываем, где эта кнопка в Safari
    const handleInstall = () => {
        if (installMode === "ios") setIsIosHintOpen(true);
        else promptInstall();
    };

    // Пункт: в рейке одна иконка, подпись во всплывающей подсказке и для экранного диктора
    const railLabel = (label: string) => (isRail ? label : undefined);
    const itemContent = (icon: ReactNode, label: string) => (
        <>
            <span className={styles.icon}>{icon}</span>
            {!isRail && <span>{label}</span>}
        </>
    );

    return (
        <m.aside
            className={clsx(styles.side, isRail && styles.rail)}
            initial={HIDDEN}
            animate={VISIBLE}
            transition={TRANSITION_PAGE}
        >
            <Link to={AppRoute.Home} className={styles.brand} aria-label={t("common:appName")}>
                {isRail ? (
                    <img className={styles.seal} src={seal} alt="" />
                ) : (
                    <>
                        <img className={styles.logo} src={logo} alt="" />
                        {/* lazy: спрятанный CSS логотип браузер не качает */}
                        <img className={styles.logoDark} src={logoDark} alt="" loading="lazy" />
                    </>
                )}
            </Link>

            <nav className={styles.nav}>
                {navLinks.map((link) => (
                    <NavLink
                        key={link.to}
                        to={link.to}
                        title={railLabel(link.label)}
                        aria-label={railLabel(link.label)}
                        data-onboarding={link.onboarding}
                        onClick={link.onClick}
                        className={({ isActive }) => clsx(styles.link, isActive && styles.linkActive)}
                    >
                        {itemContent(link.icon, link.label)}
                    </NavLink>
                ))}
            </nav>

            {/* Пункты меню прижаты к низу; обучение подсвечивает их вместо бургера */}
            <nav className={styles.menu} aria-label={t("menu:open")} data-onboarding="menu">
                {menuLinks.map((link) => (
                    <NavLink
                        key={link.to}
                        to={link.to}
                        title={railLabel(link.label)}
                        aria-label={railLabel(link.label)}
                        className={({ isActive }) => clsx(styles.link, isActive && styles.linkActive)}
                    >
                        {itemContent(link.icon, link.label)}
                    </NavLink>
                ))}
                <button
                    type="button"
                    className={styles.link}
                    title={railLabel(t("menu:help.title"))}
                    aria-label={railLabel(t("menu:help.title"))}
                    onClick={handleHelp}
                >
                    {itemContent(<HelpIcon />, t("menu:help.title"))}
                </button>
                {installMode && (
                    <button
                        type="button"
                        className={styles.link}
                        title={railLabel(t("menu:install.title"))}
                        aria-label={railLabel(t("menu:install.title"))}
                        onClick={handleInstall}
                    >
                        {itemContent(<InstallIcon />, t("menu:install.title"))}
                    </button>
                )}
            </nav>

            <Modal isOpen={isIosHintOpen} onClose={() => setIsIosHintOpen(false)} title={t("menu:install.iosTitle")}>
                <p>{t("menu:install.iosText")}</p>
            </Modal>
        </m.aside>
    );
}
