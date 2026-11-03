import { AnimatePresence, m } from "motion/react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { AppRoute } from "@/app/router";
import SectionsIcon from "@/shared/assets/icons/icon-sections.svg?react";
import TagIcon from "@/shared/assets/icons/icon-tag.svg?react";
import { TRANSITION_PAGE } from "@/shared/config/animation";
import { useLayoutMode } from "@/shared/lib/layout";
import { Breadcrumbs } from "@/shared/ui/Breadcrumbs";
import { PageHeader } from "@/shared/ui/PageHeader";
import { PageTitle } from "@/shared/ui/PageTitle";
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
    const { t } = useTranslation(["sections", "footer"]);
    const [tab, setTab] = useState<Tab>("categories");
    const mode = useLayoutMode();
    const isDesktop = mode === "desktop" || mode === "wide";

    // На компьютере вкладки — пилюли с иконками справа от заголовка
    const tabs: SegmentedOption<Tab>[] = [
        { id: "categories", label: t("tabs.categories"), icon: isDesktop && <SectionsIcon aria-hidden /> },
        { id: "tags", label: t("tabs.tags"), icon: isDesktop && <TagIcon aria-hidden /> },
    ];

    // Заголовок и подсказка берутся из раздела словаря текущей вкладки
    const title = t(`${tab}.title`);
    const hint = t(`${tab}.hint`);

    return (
        <PageWrapper
            className={styles.page}
            header={
                <PageHeader>
                    {isDesktop ? (
                        <Breadcrumbs
                            label={t("breadcrumbs")}
                            items={[
                                { label: t("footer:collection"), to: AppRoute.Home },
                                { label: t("footer:sections") },
                                { label: t(`tabs.${tab}`) },
                            ]}
                        />
                    ) : (
                        // На планшете меню в боковой навигации
                        <SectionHeading title={title} hint={hint} action={mode === "phone" && <AppMenuButton />} />
                    )}
                </PageHeader>
            }
        >
            {/* Компьютер: заголовок и подсказка в контенте, как на главной, вкладки справа, черта снизу */}
            {isDesktop ? (
                <PageTitle title={title} hint={hint}>
                    <SegmentedControl variant="pills" options={tabs} value={tab} onChange={setTab} />
                </PageTitle>
            ) : (
                <SegmentedControl options={tabs} value={tab} onChange={setTab} />
            )}
            <AnimatePresence mode="wait" initial={false}>
                <m.div
                    key={tab}
                    initial={HIDDEN}
                    animate={VISIBLE}
                    exit={HIDDEN}
                    transition={TRANSITION_PAGE}
                >
                    {tab === "categories" ? <CategoriesTab /> : <TagsTab />}
                </m.div>
            </AnimatePresence>
        </PageWrapper>
    );
}

export default SectionsPage;
