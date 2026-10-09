import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { getTheme, setTheme, type Theme } from "@/shared/lib/theme";
import { IconButton } from "@/shared/ui/Buttons";
import { PageHeader } from "@/shared/ui/PageHeader";
import { PageWrapper } from "@/shared/ui/PageWrapper";
import { Tabs } from "@/shared/ui/Tabs";

import styles from "./SettingsPage.module.scss";

const THEME_TABS: { id: Theme; label: string }[] = [
    { id: "light", label: "Светлая" },
    { id: "dark", label: "Тёмная" },
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
                    <IconButton
                        icon="back"
                        round
                        type="button"
                        aria-label="Назад"
                        onClick={() => navigate(-1)}
                    />
                    <div>
                        <h1 className={styles.title}>Настройки</h1>
                        <p className={styles.subtitle}>Чтобы на кухне всё было под рукой</p>
                    </div>
                </PageHeader>
            }
        >
            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Тема</h2>
                <Tabs tabs={THEME_TABS} active={theme} onChange={handleThemeChange} />
            </section>
        </PageWrapper>
    );
};

export default SettingsPage;
