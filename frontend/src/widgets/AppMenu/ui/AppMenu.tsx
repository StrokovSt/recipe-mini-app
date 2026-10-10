import WebApp from "@twa-dev/sdk";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";

import { AppRoute } from "@/app/router";
import ChevronIcon from "@/shared/assets/icons/icon-chevron-right.svg?react";
import InfoIcon from "@/shared/assets/icons/icon-info.svg?react";
import SettingsIcon from "@/shared/assets/icons/icon-settings.svg?react";
import UserIcon from "@/shared/assets/icons/icon-user.svg?react";
import { BottomSheet } from "@/shared/ui/BottomSheet";

import styles from "./AppMenu.module.scss";

interface AppMenuProps {
    isOpen: boolean;
    onClose: () => void;
}

interface MenuItem {
    to: AppRoute;
    icon: ReactNode;
    title: string;
    hint: string;
}

const MENU_ITEMS: MenuItem[] = [
    { to: AppRoute.Profile, icon: <UserIcon />, title: "Мой профиль", hint: "Имя и данные Telegram" },
    { to: AppRoute.Settings, icon: <SettingsIcon />, title: "Настройки", hint: "Тема, язык и анимации" },
    { to: AppRoute.About, icon: <InfoIcon />, title: "О приложении", hint: "Помощь и обратная связь" },
];

export function AppMenu(props: AppMenuProps) {
    const { isOpen, onClose } = props;

    const user = WebApp.initDataUnsafe?.user;
    const name = user?.first_name ?? "Шеф";

    return (
        <BottomSheet
            isOpen={isOpen}
            onClose={onClose}
            header={
                <article className={styles.greeting}>
                    {user?.photo_url ? (
                        <img className={styles.avatar} src={user.photo_url} alt="" />
                    ) : (
                        <span className={styles.avatar} aria-hidden>{name[0]}</span>
                    )}
                    <div>
                        <h2 className={styles.title}>{name}</h2>
                        <p className={styles.subtitle}>Профиль, настройки и всё о приложении</p>
                    </div>
                </article>
            }
        >

            <nav className={styles.list}>
                {MENU_ITEMS.map((item) => (
                    <Link key={item.to} to={item.to} className={styles.link} onClick={onClose}>
                        <span className={styles.icon}>{item.icon}</span>
                        <span className={styles.text}>
                            <span className={styles.linkTitle}>{item.title}</span>
                            <span className={styles.linkHint}>{item.hint}</span>
                        </span>
                        <ChevronIcon className={styles.chevron} />
                    </Link>
                ))}
            </nav>
        </BottomSheet>
    );
}
