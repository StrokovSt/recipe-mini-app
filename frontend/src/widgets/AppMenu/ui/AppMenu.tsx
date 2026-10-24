import { type ReactNode, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";

import { AppRoute } from "@/app/router";
import { startOnboarding } from "@/features/onboarding";
import ChevronIcon from "@/shared/assets/icons/icon-chevron-right.svg?react";
import HelpIcon from "@/shared/assets/icons/icon-help.svg?react";
import InfoIcon from "@/shared/assets/icons/icon-info.svg?react";
import InstallIcon from "@/shared/assets/icons/icon-install.svg?react";
import SettingsIcon from "@/shared/assets/icons/icon-settings.svg?react";
import UserIcon from "@/shared/assets/icons/icon-user.svg?react";
import { promptInstall, useInstallMode } from "@/shared/lib/pwa";
import { getTelegram } from "@/shared/lib/telegram";
import { BottomSheet } from "@/shared/ui/BottomSheet";
import { Modal } from "@/shared/ui/Modal";

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

export function AppMenu(props: AppMenuProps) {
    const { isOpen, onClose } = props;
    const { t } = useTranslation("menu");
    const installMode = useInstallMode();
    const [isIosHintOpen, setIsIosHintOpen] = useState(false);
    const navigate = useNavigate();

    const menuItems: MenuItem[] = [
        { to: AppRoute.Profile, icon: <UserIcon />, title: t("profile.title"), hint: t("profile.hint") },
        { to: AppRoute.Settings, icon: <SettingsIcon />, title: t("settings.title"), hint: t("settings.hint") },
        { to: AppRoute.About, icon: <InfoIcon />, title: t("about.title"), hint: t("about.hint") },
    ];

    const user = getTelegram()?.initDataUnsafe?.user;
    const name = user?.first_name ?? t("guest");

    // На iPhone нет системного окна установки: закрываем меню и показываем, где эта кнопка в Safari
    const handleInstall = () => {
        onClose();
        if (installMode === "ios") setIsIosHintOpen(true);
        else promptInstall();
    };

    // Обучение идёт на главной: переходим туда (replace — из открытой шторки) и запускаем заново
    const handleHelp = () => {
        onClose();
        navigate(AppRoute.Home, { replace: true });
        startOnboarding();
    };

    return (
        <>
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
                            <p className={styles.subtitle}>{t("subtitle")}</p>
                        </div>
                    </article>
                }
            >

                <nav className={styles.list}>
                    {menuItems.map((item) => (
                        <Link key={item.to} to={item.to} replace className={styles.link} onClick={onClose}>
                            <span className={styles.icon}>{item.icon}</span>
                            <span className={styles.text}>
                                <span className={styles.linkTitle}>{item.title}</span>
                                <span className={styles.linkHint}>{item.hint}</span>
                            </span>
                            <ChevronIcon className={styles.chevron} />
                        </Link>
                    ))}

                    <button type="button" className={styles.link} onClick={handleHelp}>
                        <span className={styles.icon}><HelpIcon /></span>
                        <span className={styles.text}>
                            <span className={styles.linkTitle}>{t("help.title")}</span>
                            <span className={styles.linkHint}>{t("help.hint")}</span>
                        </span>
                        <ChevronIcon className={styles.chevron} />
                    </button>

                    {installMode && (
                        <button type="button" className={styles.link} onClick={handleInstall}>
                            <span className={styles.icon}><InstallIcon /></span>
                            <span className={styles.text}>
                                <span className={styles.linkTitle}>{t("install.title")}</span>
                                <span className={styles.linkHint}>{t("install.hint")}</span>
                            </span>
                            <ChevronIcon className={styles.chevron} />
                        </button>
                    )}
                </nav>
            </BottomSheet>

            <Modal isOpen={isIosHintOpen} onClose={() => setIsIosHintOpen(false)} title={t("install.iosTitle")}>
                <p>{t("install.iosText")}</p>
            </Modal>
        </>
    );
}
