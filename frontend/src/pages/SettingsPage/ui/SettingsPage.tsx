import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { LanguageSelect } from "@/features/select-language";
import MoonIcon from "@/shared/assets/icons/icon-moon.svg?react";
import SunIcon from "@/shared/assets/icons/icon-sun.svg?react";
import { getAnimations, setAnimations } from "@/shared/lib/animations";
import { getTheme, setTheme, type Theme } from "@/shared/lib/theme";
import { IconButton } from "@/shared/ui/Buttons";
import { PageHeader } from "@/shared/ui/PageHeader";
import { PageWrapper } from "@/shared/ui/PageWrapper";
import { SectionCard } from "@/shared/ui/SectionCard";
import { SegmentedControl, type SegmentedOption } from "@/shared/ui/SegmentedControl";
import { Switch } from "@/shared/ui/Switch";

import styles from "./SettingsPage.module.scss";

const SettingsPage = () => {
    const { t } = useTranslation(["settings", "common"]);
    const navigate = useNavigate();
    const [theme, setThemeState] = useState<Theme>(getTheme);
    const [animations, setAnimationsState] = useState(getAnimations);

    const themeOptions: SegmentedOption<Theme>[] = [
        { id: "light", label: t("appearance.light"), icon: <SunIcon /> },
        { id: "dark", label: t("appearance.dark"), icon: <MoonIcon /> },
    ];

    const handleThemeChange = (next: Theme) => {
        setTheme(next);
        setThemeState(next);
    };

    const handleAnimationsChange = (enabled: boolean) => {
        setAnimations(enabled);
        setAnimationsState(enabled);
    };

    return (
        <PageWrapper
            header={
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
            }
        >
            <SectionCard mark="一" title={t("appearance.title")} description={t("appearance.description")}>
                <SegmentedControl options={themeOptions} value={theme} onChange={handleThemeChange} />
            </SectionCard>

            <SectionCard mark="二" title={t("language.title")} description={t("language.description")}>
                <LanguageSelect />
            </SectionCard>

            <SectionCard mark="三" title={t("motion.title")} description={t("motion.description")}>
                <Switch
                    label={t("motion.animations")}
                    description={animations ? t("motion.on") : t("motion.off")}
                    checked={animations}
                    onChange={handleAnimationsChange}
                />
            </SectionCard>
        </PageWrapper>
    );
};

export default SettingsPage;
