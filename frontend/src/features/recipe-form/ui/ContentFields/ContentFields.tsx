import { memo, useRef } from "react";
import { useFormState } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { animateContentChange } from "@/shared/lib/animations";
import { useLayoutMode } from "@/shared/lib/layout";
import { SectionCard } from "@/shared/ui/SectionCard";
import { SegmentedControl, type SegmentedOption } from "@/shared/ui/SegmentedControl";

import type { RecipeFormValues } from "../../model/schema";
import type { ContentTab } from "../../model/types";
import IngredientsField from "../IngredientsField/IngredientsField";
import StepsField from "../StepsField/StepsField";

import styles from "./ContentFields.module.scss";

interface ContentFieldsProps {
    tab: ContentTab;
    onTabChange: (tab: ContentTab) => void;
}

// Ингредиенты и шаги в одной карточке на вкладках, как на странице рецепта.
// Красная точка перед названием вкладки: там ошибка, которую не видно с другой вкладки.
// На компьютере места хватает: две карточки друг под другом, без вкладок
const ContentFields = ({ tab, onTabChange }: ContentFieldsProps) => {
    const { t } = useTranslation("recipeForm");
    const { errors } = useFormState<RecipeFormValues>({ name: ["ingredients", "steps"] });
    const cardRef = useRef<HTMLElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);
    const mode = useLayoutMode();

    // Вкладки разной высоты: карточка плавно меняет высоту, а не прыгает
    const switchTab = (next: ContentTab) => {
        if (!cardRef.current || !panelRef.current) return onTabChange(next);
        animateContentChange(cardRef.current, panelRef.current, () => onTabChange(next));
    };

    if (mode === "desktop" || mode === "wide") {
        return (
            <>
                <SectionCard mark="三" title={t("sections.ingredients")}>
                    <IngredientsField />
                </SectionCard>
                <SectionCard mark="四" title={t("sections.steps")}>
                    <StepsField />
                </SectionCard>
            </>
        );
    }

    const tabs: SegmentedOption<ContentTab>[] = (["ingredients", "steps"] as const).map((id) => ({
        id,
        label: t(`sections.${id}`),
        icon: errors[id] && <span className={styles.errorDot} aria-hidden />,
    }));

    return (
        <section ref={cardRef} className={styles.card}>
            <SegmentedControl options={tabs} value={tab} onChange={switchTab} />
            <div ref={panelRef} className={styles.panel}>
                {tab === "ingredients" ? <IngredientsField /> : <StepsField />}
            </div>
        </section>
    );
};

// memo: статус черновика и вкладки формы меняются часто, поля от них не зависят
export default memo(ContentFields);
