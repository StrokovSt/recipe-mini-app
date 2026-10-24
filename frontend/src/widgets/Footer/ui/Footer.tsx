import clsx from "clsx";
import { AnimatePresence, m } from "motion/react";
import { type MouseEvent, type ReactNode, useState } from "react";
import { useTranslation } from "react-i18next";
import { matchPath, NavLink, useLocation } from "react-router-dom";

import { AppRoute } from "@/app/router";
import AddIcon from "@/shared/assets/icons/icon-add.svg?react";
import CollectionIcon from "@/shared/assets/icons/icon-collection.svg?react";
import SectionsIcon from "@/shared/assets/icons/icon-sections.svg?react";
import { TRANSITION_PAGE } from "@/shared/config/animation";
import { getAnimations } from "@/shared/lib/animations";
import { impactHaptic } from "@/shared/lib/haptic";
import { useSetPageFooterSlot } from "@/shared/ui/PageFooter";
import { Toast } from "@/shared/ui/Toast";

import { type Burst, createPetals } from "./PetalBurst/createPetals";
import { PetalBurst } from "./PetalBurst/PetalBurst";

import styles from "./Footer.module.scss";

// На формах вместо навигации в плашке кнопка страницы (сохранить, распознать), её кладёт PageFooter
const ACTION_ON: AppRoute[] = [AppRoute.CreateRecipe, AppRoute.Draft, AppRoute.ImportRecipe, AppRoute.EditRecipe];

const HIDDEN = { opacity: 0 };
const VISIBLE = { opacity: 1 };

// Центр кнопки «+» внутри приложения: оттуда разлетаются лепестки
const getBurst = (button: HTMLElement): Burst | null => {
    const root = document.getElementById("root");
    if (!root) return null;

    const rect = button.getBoundingClientRect();
    const rootRect = root.getBoundingClientRect();

    return {
        id: Date.now(),
        x: rect.left + rect.width / 2 - rootRect.left,
        y: rect.top + rect.height / 2 - rootRect.top,
        petals: createPetals(),
    };
};

interface NavItem {
    to: AppRoute;
    icon: ReactNode;
    label: string;
    isAdd?: boolean;
    // Метка для обучения на главной (features/onboarding)
    onboarding?: string;
}

export function Footer() {
    const { t } = useTranslation("footer");
    const { pathname } = useLocation();
    const setSlot = useSetPageFooterSlot();

    const hasAction = ACTION_ON.some((path) => matchPath(path, pathname));

    const [burst, setBurst] = useState<Burst | null>(null);

    // Нажали «+»: вибрация и лепестки, переход обычный
    const handleAddClick = (event: MouseEvent<HTMLAnchorElement>) => {
        impactHaptic();
        if (getAnimations()) setBurst(getBurst(event.currentTarget));
    };

    const navItems: NavItem[] = [
        { to: AppRoute.Home, icon: <CollectionIcon />, label: t("collection"), onboarding: "home" },
        { to: AppRoute.AddRecipe, icon: <AddIcon />, label: t("add"), isAdd: true, onboarding: "add" },
        { to: AppRoute.Sections, icon: <SectionsIcon />, label: t("sections"), onboarding: "sections" },
    ];

    return (
        <m.footer className={styles.footer} initial={HIDDEN} animate={VISIBLE} transition={TRANSITION_PAGE}>
            {/* Плашка стоит на месте, навигация и кнопка формы сменяют друг друга внутри */}
            <div className={clsx(styles.nav, hasAction && styles.navAction)}>
                <AnimatePresence mode="wait" initial={false}>
                    {hasAction ? (
                        <m.div
                            key="action"
                            ref={setSlot}
                            className={styles.action}
                            initial={HIDDEN}
                            animate={VISIBLE}
                            exit={HIDDEN}
                            transition={TRANSITION_PAGE}
                        />
                    ) : (
                        <m.nav
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
                                        data-onboarding={item.onboarding}
                                        onClick={handleAddClick}
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
                                        data-onboarding={item.onboarding}
                                        className={({ isActive }) =>
                                            clsx(styles.navBtn, isActive && styles.navBtnActive)
                                        }
                                    >
                                        <span className={styles.navIcon}>{item.icon}</span>
                                        <span className={styles.navLabel}>{item.label}</span>
                                    </NavLink>
                                )
                            )}
                        </m.nav>
                    )}
                </AnimatePresence>

                {/* Уведомления над плашкой, например «Рецепт распознан» */}
                <Toast className={styles.toast} />
            </div>

            <PetalBurst burst={burst} onDone={() => setBurst(null)} />
        </m.footer>
    );
}
