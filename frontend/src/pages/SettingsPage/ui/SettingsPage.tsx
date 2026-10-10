import { useState } from "react";
import { useNavigate } from "react-router-dom";

import MoonIcon from "@/shared/assets/icons/icon-moon.svg?react";
import SunIcon from "@/shared/assets/icons/icon-sun.svg?react";
import { getTheme, setTheme, type Theme } from "@/shared/lib/theme";
import { IconButton } from "@/shared/ui/Buttons";
import { PageHeader } from "@/shared/ui/PageHeader";
import { PageWrapper } from "@/shared/ui/PageWrapper";
import { SegmentedControl, type SegmentedOption } from "@/shared/ui/SegmentedControl";

import styles from "./SettingsPage.module.scss";

const THEME_OPTIONS: SegmentedOption<Theme>[] = [
    { id: "light", label: "Светлая", icon: <SunIcon /> },
    { id: "dark", label: "Тёмная", icon: <MoonIcon /> },
];

const SettingsPage = () => {
    const navigate = useNavigate();
    const [theme, setThemeState] = useState<Theme>(getTheme);

    const handleThemeChange = (next: Theme) => {
        setTheme(next);
        setThemeState(next);
    };

    return (
        <PageWrapper
            header={
                <PageHeader className={styles.header}>
                    <div>
                        <h1 className={styles.title}>Настройки</h1>
                        <p className={styles.subtitle}>Чтобы на кухне всё было под рукой</p>
                    </div>
                    <IconButton
                        icon="back"
                        round
                        className={styles.back}
                        type="button"
                        aria-label="Назад"
                        onClick={() => navigate(-1)}
                    />
                </PageHeader>
            }
        >
            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Тема</h2>
                <SegmentedControl options={THEME_OPTIONS} value={theme} onChange={handleThemeChange} />
            </section>
        </PageWrapper>
    );
};

export default SettingsPage;
