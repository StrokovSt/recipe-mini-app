import { useState } from "react";

import { useCategories } from "@/entities/category";
import { useTags } from "@/entities/tag";
import { pluralize } from "@/shared/lib/plural";
import { PageHeader } from "@/shared/ui/PageHeader";
import { PageWrapper } from "@/shared/ui/PageWrapper";
import { SectionHeading } from "@/shared/ui/SectionHeading";
import { SegmentedControl, type SegmentedOption } from "@/shared/ui/SegmentedControl";
import { AppMenuButton } from "@/widgets/AppMenu";

import CategoriesTab from "./CategoriesTab/CategoriesTab";
import { TagsTab } from "./TagsTab/TagsTab";

import styles from "./SectionsPage.module.scss";

type Tab = "categories" | "tags";

const TABS: SegmentedOption<Tab>[] = [
    { id: "categories", label: "Категории" },
    { id: "tags", label: "Теги" },
];

const HEADINGS: Record<Tab, { title: string; hint: string; forms: [string, string, string] }> = {
    categories: {
        title: "Мои категории",
        hint: "Рецепты по полочкам",
        forms: ["категория", "категории", "категорий"],
    },
    tags: {
        title: "Мои теги",
        hint: "Быстрый поиск рецептов",
        forms: ["тег", "тега", "тегов"],
    },
};

const SectionsPage = () => {
    const [tab, setTab] = useState<Tab>("categories");
    const { data: categories = [] } = useCategories();
    const { data: tags = [] } = useTags();

    const heading = HEADINGS[tab];
    const count = tab === "categories" ? categories.length : tags.length;

    return (
        <PageWrapper
            className={styles.page}
            header={
                <PageHeader>
                    <SectionHeading
                        title={heading.title}
                        hint={heading.hint}
                        total={`${count} ${pluralize(count, heading.forms)}`}
                        action={<AppMenuButton />}
                    />
                </PageHeader>
            }
        >
            <SegmentedControl options={TABS} value={tab} onChange={setTab} />
            {tab === "categories" ? <CategoriesTab /> : <TagsTab />}
        </PageWrapper>
    );
}

export default SectionsPage;
