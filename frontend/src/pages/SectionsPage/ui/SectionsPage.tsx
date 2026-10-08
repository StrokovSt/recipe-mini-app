import { useState } from "react";

import { PageHeader } from "@/shared/ui/PageHeader";
import { PageWrapper } from "@/shared/ui/PageWrapper";
import { Tabs } from "@/shared/ui/Tabs";

import CategoriesTab from "./CategoriesTab/CategoriesTab";
import { TagsTab } from "./TagsTab/TagsTab";

import styles from "./SectionsPage.module.scss";

type Tab = "categories" | "tags";

const TABS: { id: Tab; label: string }[] = [
    { id: "categories", label: "Категории" },
    { id: "tags", label: "Теги" },
];

const SectionsPage = () => {
    const [tab, setTab] = useState<Tab>("categories");

    return (
        <PageWrapper
            className={styles.page}
            header={
                <PageHeader className={styles.header}>
                    <Tabs tabs={TABS} active={tab} onChange={setTab} className={styles.tabs} />
                </PageHeader>
            }
        >
            {tab === "categories" ? <CategoriesTab /> : <TagsTab />}
        </PageWrapper>
    );
}

export default SectionsPage;
