import clsx from "clsx";
import { useState } from "react";

import { PageWrapper } from "@/shared/ui/PageWrapper";

import CategoriesTab from "./CategoriesTab/CategoriesTab";
import { TagsTab } from "./TagsTab/TagsTab";

import styles from "./SettingsPage.module.scss";

type Tab = "categories" | "tags";

const TABS: { id: Tab; label: string }[] = [
    { id: "categories", label: "Категории" },
    { id: "tags", label: "Теги" },
];

const SettingsPage = () => {
    const [tab, setTab] = useState<Tab>("categories");

    return (
        <PageWrapper className={styles.page}>
            <div className={styles.tabs}>
                {TABS.map((t) => (
                    <button
                        key={t.id}
                        onClick={() => setTab(t.id)}
                        className={clsx(styles.tab, tab === t.id && styles.tabActive)}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            {tab === "categories" ? <CategoriesTab /> : <TagsTab />}
        </PageWrapper>
    );
}

export default SettingsPage;