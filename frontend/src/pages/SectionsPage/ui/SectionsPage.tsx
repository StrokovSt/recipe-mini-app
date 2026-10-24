import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { TRANSITION_PAGE } from "@/shared/config/animation";
import { PageHeader } from "@/shared/ui/PageHeader";
import { PageWrapper } from "@/shared/ui/PageWrapper";
import { SectionHeading } from "@/shared/ui/SectionHeading";
import { SegmentedControl, type SegmentedOption } from "@/shared/ui/SegmentedControl";
import { AppMenuButton } from "@/widgets/AppMenu";

import CategoriesTab from "./CategoriesTab/CategoriesTab";
import { TagsTab } from "./TagsTab/TagsTab";

import styles from "./SectionsPage.module.scss";

type Tab = "categories" | "tags";

// Смена вкладки как переход между страницами: старая гаснет, новая проявляется
const HIDDEN = { opacity: 0, transform: "translateY(8px)" };
const VISIBLE = { opacity: 1, transform: "translateY(0px)", transitionEnd: { transform: "none" } };

const SectionsPage = () => {
    const { t } = useTranslation("sections");
    const [tab, setTab] = useState<Tab>("categories");

    const tabs: SegmentedOption<Tab>[] = [
        { id: "categories", label: t("tabs.categories") },
        { id: "tags", label: t("tabs.tags") },
    ];

    return (
        <PageWrapper
            className={styles.page}
            header={
                <PageHeader>
                    {/* Заголовок и подсказка берутся из раздела словаря текущей вкладки */}
                    <SectionHeading
                        title={t(`${tab}.title`)}
                        hint={t(`${tab}.hint`)}
                        action={<AppMenuButton />}
                    />
                </PageHeader>
            }
        >
            <SegmentedControl options={tabs} value={tab} onChange={setTab} />
            <AnimatePresence mode="wait" initial={false}>
                <motion.div
                    key={tab}
                    initial={HIDDEN}
                    animate={VISIBLE}
                    exit={HIDDEN}
                    transition={TRANSITION_PAGE}
                >
                    {tab === "categories" ? <CategoriesTab /> : <TagsTab />}
                </motion.div>
            </AnimatePresence>
        </PageWrapper>
    );
}

export default SectionsPage;
