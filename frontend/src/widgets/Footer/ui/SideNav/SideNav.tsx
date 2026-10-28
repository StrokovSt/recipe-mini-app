import clsx from "clsx";
import { animate, m, type MotionStyle, type PanInfo, useMotionValue } from "motion/react";
import { type KeyboardEvent, type MouseEvent, type ReactNode, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, NavLink, useLocation, useNavigate, useSearchParams } from "react-router-dom";

import { AppRoute } from "@/app/router";
import { getCategoryIcon, useCategories } from "@/entities/category";
import { startOnboarding } from "@/features/onboarding";
import AddIcon from "@/shared/assets/icons/icon-add.svg?react";
import ExpandIcon from "@/shared/assets/icons/icon-chevron-right.svg?react";
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
import { TRANSITION_BASE, TRANSITION_PAGE } from "@/shared/config/animation";
import { promptInstall, useInstallMode } from "@/shared/lib/pwa";
import { Modal } from "@/shared/ui/Modal";

import styles from "./SideNav.module.scss";

const HIDDEN = { opacity: 0 };
const VISIBLE = { opacity: 1 };
// Резкий рывок сам решает, раскрыть шторку или свернуть, даже если её не дотянули до середины, px/s
const FLICK_VELOCITY = 300;

// Размер из CSS-переменной в px: ширина рейки и раскрытой панели
const readSize = (element: HTMLElement, name: string) => parseFloat(getComputedStyle(element).getPropertyValue(name));

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
// В рейке квадратные иконки без подписей, на компьютере строки с подписями.
// Рейка раскрывается, как шторка: удлиняется поверх контента, иконки на местах, появляются подписи и категории
export function SideNav(props: SideNavProps) {
    const { isRail, onAddClick } = props;
    const { t } = useTranslation(["footer", "common", "menu", "sections"]);
    const { pathname } = useLocation();
    const [searchParams] = useSearchParams();
    const { data: categories = [] } = useCategories();
    const navigate = useNavigate();
    const installMode = useInstallMode();
    const [isIosHintOpen, setIsIosHintOpen] = useState(false);
    // Куда едет шторка: раскрыта или свёрнута
    const [isExpanded, setIsExpanded] = useState(false);
    // Шторка хоть немного раскрыта: категории в разметке, пока она не свернётся до конца
    const [isRevealed, setIsRevealed] = useState(false);
    // Насколько раскрыта рейка, от 0 до 1. От неё в CSS зависят ширина, тень, подписи, категории, стрелка
    // и затемнение. Меняется без перерисовок: под пальцем напрямую, после — анимацией
    const progress = useMotionValue(0);
    const asideRef = useRef<HTMLElement>(null);
    const toggleRef = useRef<HTMLButtonElement>(null);
    // Шторку тянут: на сколько px она раскрывается и с какого раскрытия начали
    const panRef = useRef<{ range: number; start: number } | null>(null);
    // Шторку потянули: отпущенная кнопка мыши не должна нажать пункт под ней
    const hasPannedRef = useRef(false);

    const isOpen = isRail && isExpanded;
    // Подписи и категории: на компьютере всегда, на планшете в раскрытой рейке
    const isFull = !isRail || isRevealed;

    // Шторка доезжает до конца с того места, где она сейчас
    const settle = (open: boolean) => {
        setIsExpanded(open);
        if (open) setIsRevealed(true);
        animate(progress, open ? 1 : 0, TRANSITION_BASE).then(() => {
            if (progress.get() === 0) setIsRevealed(false);
        });
    };

    // Фокус на кнопку «Свернуть»: Esc ловит сама рейка
    const expand = () => {
        settle(true);
        toggleRef.current?.focus({ preventScroll: true });
    };
    const collapse = () => isOpen && settle(false);
    const toggle = () => (isOpen ? collapse() : expand());

    const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === "Escape" && isOpen) collapse();
    };

    const handlePanStart = (_: unknown, info: PanInfo) => {
        const aside = asideRef.current;
        // Движение по вертикали — прокрутка списка категорий, а не шторка
        if (!aside || Math.abs(info.offset.y) > Math.abs(info.offset.x)) return;
        hasPannedRef.current = true;
        progress.stop();
        setIsRevealed(true);
        panRef.current = {
            range: readSize(aside, "--size-sidebar") - readSize(aside, "--size-rail"),
            start: progress.get(),
        };
    };

    // Шторка идёт за пальцем, от рейки до панели
    const handlePan = (_: unknown, info: PanInfo) => {
        const pan = panRef.current;
        if (!pan) return;
        progress.set(Math.min(1, Math.max(0, pan.start + info.offset.x / pan.range)));
    };

    // Отпустили: раскрываем, если дотянули дальше середины или резко дёрнули вправо
    const handlePanEnd = (_: unknown, info: PanInfo) => {
        if (!panRef.current) return;
        panRef.current = null;
        const isFlick = Math.abs(info.velocity.x) > FLICK_VELOCITY;
        const shouldOpen = isFlick ? info.velocity.x > 0 : progress.get() > 0.5;
        settle(shouldOpen);
        if (shouldOpen) toggleRef.current?.focus({ preventScroll: true });
    };

    const handleClickCapture = (event: MouseEvent) => {
        if (!hasPannedRef.current) return;
        event.preventDefault();
        event.stopPropagation();
    };

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
        collapse();
        navigate(AppRoute.Home);
        startOnboarding();
    };

    // На iPhone нет системного окна установки: показываем, где эта кнопка в Safari
    const handleInstall = () => {
        if (installMode === "ios") setIsIosHintOpen(true);
        else promptInstall();
    };

    // Категория, выбранная на главной. Пока она выбрана, «Коллекция» не подсвечена: подсвечена категория
    const activeCategory = isFull && pathname === AppRoute.Home ? searchParams.get("category") : null;

    // В панели только категории с рецептами, пустые зря занимают место. Выбранная остаётся, даже если опустела
    const sideCategories = categories.filter(
        (category) => (category.recipeCount ?? 0) > 0 || category.id === activeCategory
    );

    // Ссылка на категорию: на главной поиск и теги остаются, меняется только категория
    const getCategoryHref = (id: string) => {
        const params = new URLSearchParams(pathname === AppRoute.Home ? searchParams : undefined);
        params.set("category", id);
        return `${AppRoute.Home}?${params}`;
    };

    // Подпись всегда в разметке: в свёрнутой рейке её прячет край кнопки, название даёт всплывающая подсказка
    const railTitle = (label: string) => (isRail && !isOpen ? label : undefined);
    const itemContent = (icon: ReactNode, label: string) => (
        <>
            <span className={styles.icon}>{icon}</span>
            <span className={styles.label}>{label}</span>
        </>
    );

    return (
        <>
            {/* Раскрытая рейка поверх контента. Затемнение темнеет вместе с ней и сворачивает её по нажатию */}
            {isRail && (
                <m.div
                    className={clsx(styles.scrim, isOpen && styles.scrimActive)}
                    style={{ opacity: progress }}
                    onClick={collapse}
                />
            )}
            <m.aside
                ref={asideRef}
                className={clsx(styles.side, isRail && styles.rail)}
                style={{ "--rail-progress": progress } as MotionStyle}
                initial={HIDDEN}
                animate={VISIBLE}
                transition={TRANSITION_PAGE}
                onKeyDown={handleKeyDown}
                onPanStart={isRail ? handlePanStart : undefined}
                onPan={isRail ? handlePan : undefined}
                onPanEnd={isRail ? handlePanEnd : undefined}
                onPointerDownCapture={() => (hasPannedRef.current = false)}
                onClickCapture={handleClickCapture}
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
                    {/* «Развернуть» в одной группе с навигацией, первой */}
                    {isRail && (
                        <button
                            ref={toggleRef}
                            type="button"
                            className={clsx(styles.link, styles.toggle)}
                            title={railTitle(t("expand"))}
                            aria-expanded={isOpen}
                            onClick={toggle}
                        >
                            {itemContent(<ExpandIcon />, isOpen ? t("collapse") : t("expand"))}
                        </button>
                    )}
                    {navLinks.map((link) => (
                        <NavLink
                            key={link.to}
                            to={link.to}
                            title={railTitle(link.label)}
                            data-onboarding={link.onboarding}
                            onClick={(event) => {
                                link.onClick?.(event);
                                collapse();
                            }}
                            className={({ isActive }) =>
                                clsx(styles.link, isActive && !(link.to === AppRoute.Home && activeCategory) && styles.linkActive)
                            }
                        >
                            {itemContent(link.icon, link.label)}
                        </NavLink>
                    ))}
                </nav>

                {/* Категории в панели на компьютере и в раскрытой рейке, в свёрнутой для них нет места */}
                {isFull && sideCategories.length > 0 && (
                    <nav className={styles.categories} aria-labelledby="side-nav-categories">
                        <h2 id="side-nav-categories" className={styles.group}>{t("sections:tabs.categories")}</h2>
                        {/* Панель всегда в высоту экрана: если категорий много, прокручивается только этот список */}
                        <div className={styles.categoryList}>
                            {sideCategories.map((category) => {
                                const Icon = getCategoryIcon(category.iconName);

                                return (
                                    <Link
                                        key={category.id}
                                        to={getCategoryHref(category.id)}
                                        // На главной фильтр меняется без новой записи в истории, как в окне фильтров
                                        replace={pathname === AppRoute.Home}
                                        onClick={collapse}
                                        className={clsx(styles.link, category.id === activeCategory && styles.linkActive)}
                                    >
                                        <span className={styles.icon}><Icon /></span>
                                        <span className={styles.label}>{category.name}</span>
                                        <span className={styles.count}>{category.recipeCount ?? 0}</span>
                                    </Link>
                                );
                            })}
                        </div>
                    </nav>
                )}

                {/* Пункты меню (в рейке прижаты к низу); обучение подсвечивает их вместо бургера */}
                <nav className={styles.menu} aria-label={t("menu:open")} data-onboarding="menu">
                    {menuLinks.map((link) => (
                        <NavLink
                            key={link.to}
                            to={link.to}
                            title={railTitle(link.label)}
                            onClick={collapse}
                            className={({ isActive }) => clsx(styles.link, isActive && styles.linkActive)}
                        >
                            {itemContent(link.icon, link.label)}
                        </NavLink>
                    ))}
                    <button
                        type="button"
                        className={styles.link}
                        title={railTitle(t("menu:help.title"))}
                        onClick={handleHelp}
                    >
                        {itemContent(<HelpIcon />, t("menu:help.title"))}
                    </button>
                    {installMode && (
                        <button
                            type="button"
                            className={styles.link}
                            title={railTitle(t("menu:install.title"))}
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
            {/* Ручка на краю рейки, как у шторки: потянуть или нажать. Вне рейки, чтобы зона захвата заходила
                и на контент — так за неё легко взяться пальцем. Для экранного диктора хватает кнопки «Развернуть» */}
            {isRail && (
                <m.div
                    className={styles.handle}
                    aria-hidden
                    style={{ "--rail-progress": progress } as MotionStyle}
                    onPanStart={handlePanStart}
                    onPan={handlePan}
                    onPanEnd={handlePanEnd}
                    onPointerDown={() => (hasPannedRef.current = false)}
                    onClick={() => !hasPannedRef.current && toggle()}
                />
            )}
        </>
    );
}
