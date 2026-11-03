import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { AppRoute } from "@/app/router";
import { useUpdateSettings } from "@/entities/user";
import { LanguageSelect } from "@/features/select-language";
import MoonIcon from "@/shared/assets/icons/icon-moon.svg?react";
import SunIcon from "@/shared/assets/icons/icon-sun.svg?react";
import seal from "@/shared/assets/images/seal.webp";
import { getAnimations, setAnimations } from "@/shared/lib/animations";
import { useLayoutMode } from "@/shared/lib/layout";
import { getTheme, setTheme, type Theme } from "@/shared/lib/theme";
import { Breadcrumbs } from "@/shared/ui/Breadcrumbs";
import { IconButton, RegularButton } from "@/shared/ui/Buttons";
import { PageHeader } from "@/shared/ui/PageHeader";
import { PageTitle } from "@/shared/ui/PageTitle";
import { PageWrapper } from "@/shared/ui/PageWrapper";
import { SectionCard } from "@/shared/ui/SectionCard";
import { SegmentedControl, type SegmentedOption } from "@/shared/ui/SegmentedControl";
import { Switch } from "@/shared/ui/Switch";

import { version } from "../../../../package.json";
import { ThemePicker } from "./ThemePicker/ThemePicker";

import styles from "./SettingsPage.module.scss";

const SettingsPage = () => {
    const { t } = useTranslation(["settings", "common", "footer", "about", "menu"]);
    const mode = useLayoutMode();
    const isDesktop = mode === "desktop" || mode === "wide";
    const navigate = useNavigate();
    const [theme, setThemeState] = useState<Theme>(getTheme);
    const [animations, setAnimationsState] = useState(getAnimations);
    const { mutate: updateSettings } = useUpdateSettings();

    const themeOptions: SegmentedOption<Theme>[] = [
        { id: "light", label: t("appearance.light"), icon: <SunIcon /> },
        { id: "dark", label: t("appearance.dark"), icon: <MoonIcon /> },
    ];

    const handleThemeChange = (next: Theme) => {
        setTheme(next);
        setThemeState(next);
        updateSettings({ theme: next });
    };

    const handleAnimationsChange = (enabled: boolean) => {
        setAnimations(enabled);
        setAnimationsState(enabled);
        updateSettings({ animations: enabled });
    };

    const languageCard = (
        <SectionCard mark="二" title={t("language.title")} description={t("language.description")}>
            <LanguageSelect />
        </SectionCard>
    );

    const motionCard = (
        <SectionCard mark="三" title={t("motion.title")} description={t("motion.description")}>
            <Switch
                label={t("motion.animations")}
                description={animations ? t("motion.on") : t("motion.off")}
                checked={animations}
                onChange={handleAnimationsChange}
            />
        </SectionCard>
    );

    return (
        <PageWrapper
            header={
                // Компьютер: путь к странице в шапке, заголовок в контенте. Телефон и планшет: заголовок в шапке
                isDesktop ? (
                    <PageHeader>
                        <Breadcrumbs label={t("common:breadcrumbs")} items={[{ label: t("footer:collection"), to: AppRoute.Home }, { label: t("title") }]} />
                    </PageHeader>
                ) : (
                <PageHeader className={styles.header}>
                    <div>
                        <h1 className={styles.title}>{t("title")}</h1>
                        <p className={styles.subtitle}>{t("subtitle")}</p>
                    </div>
                    <IconButton
                        icon="back"
                        round
                        className={styles.back}
                        type="button"
                        aria-label={t("common:back")}
                        onClick={() => navigate(-1)}
                    />
                </PageHeader>
                )
            }
        >
            {isDesktop && <PageTitle title={t("title")} hint={t("subtitle")} />}

            {/* Компьютер: карточки слева (оформление на всю ширину, язык и движение рядом), справа блок о приложении */}
            {isDesktop ? (
                <div className={styles.layout}>
                    <div className={styles.cards}>
                        <SectionCard
                            mark="一"
                            title={t("appearance.title")}
                            description={t("appearance.description")}
                            className={styles.wide}
                        >
                            <ThemePicker
                                options={themeOptions}
                                value={theme}
                                onChange={handleThemeChange}
                                label={t("appearance.title")}
                            />
                        </SectionCard>
                        {languageCard}
                        {motionCard}
                    </div>

                    <aside className={styles.aside}>
                        <img className={styles.picture} src={seal} alt="" />
                        <h2 className={styles.asideTitle}>{t("common:appName")}</h2>
                        <span className={styles.version}>{t("about:version", { version })}</span>
                        <p className={styles.text}>{t("aside")}</p>
                        <RegularButton
                            type="button"
                            className={styles.about}
                            label={t("menu:about.title")}
                            onClick={() => navigate(AppRoute.About)}
                        />
                    </aside>
                </div>
            ) : (
                <>
                    <SectionCard mark="一" title={t("appearance.title")} description={t("appearance.description")}>
                        <SegmentedControl options={themeOptions} value={theme} onChange={handleThemeChange} />
                    </SectionCard>
                    {languageCard}
                    {motionCard}
                </>
            )}
        </PageWrapper>
    );
};

export default SettingsPage;
