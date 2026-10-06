import { useState } from "react";

import { PageWrapper } from "@/shared/ui/PageWrapper";
import { Tabs } from "@/shared/ui/Tabs";

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
            <Tabs tabs={TABS} active={tab} onChange={setTab} className={styles.tabs} />

            {tab === "categories" ? <CategoriesTab /> : <TagsTab />}
        </PageWrapper>
    );
}

export default SettingsPage;
