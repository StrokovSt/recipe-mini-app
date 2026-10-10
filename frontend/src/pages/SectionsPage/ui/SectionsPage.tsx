import { useState } from "react";
import { useTranslation } from "react-i18next";

import { useCategories } from "@/entities/category";
import { useTags } from "@/entities/tag";
import { PageHeader } from "@/shared/ui/PageHeader";
import { PageWrapper } from "@/shared/ui/PageWrapper";
import { SectionHeading } from "@/shared/ui/SectionHeading";
import { SegmentedControl, type SegmentedOption } from "@/shared/ui/SegmentedControl";
import { AppMenuButton } from "@/widgets/AppMenu";

import CategoriesTab from "./CategoriesTab/CategoriesTab";
import { TagsTab } from "./TagsTab/TagsTab";

import styles from "./SectionsPage.module.scss";

type Tab = "categories" | "tags";

const SectionsPage = () => {
    const { t } = useTranslation("sections");
    const [tab, setTab] = useState<Tab>("categories");
    const { data: categories = [] } = useCategories();
    const { data: tags = [] } = useTags();

    const tabs: SegmentedOption<Tab>[] = [
        { id: "categories", label: t("tabs.categories") },
        { id: "tags", label: t("tabs.tags") },
    ];

    // Заголовок, подсказка и счётчик берутся из раздела словаря текущей вкладки
    const count = tab === "categories" ? categories.length : tags.length;

    return (
        <PageWrapper
            className={styles.page}
            header={
                <PageHeader>
                    <SectionHeading
                        title={t(`${tab}.title`)}
                        hint={t(`${tab}.hint`)}
                        total={t(`${tab}.total`, { count })}
                        action={<AppMenuButton />}
                    />
                </PageHeader>
            }
        >
            <SegmentedControl options={tabs} value={tab} onChange={setTab} />
            {tab === "categories" ? <CategoriesTab /> : <TagsTab />}
        </PageWrapper>
    );
}

export default SectionsPage;
