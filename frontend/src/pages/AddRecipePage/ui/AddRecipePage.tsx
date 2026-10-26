import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { AppRoute } from "@/app/router";
import { useDrafts } from "@/entities/draft";
import { useMe } from "@/entities/user";
import { useImportsInProgress } from "@/features/recipe-form";
import FormIcon from "@/shared/assets/icons/icon-form.svg?react";
import ImageIcon from "@/shared/assets/icons/icon-image.svg?react";
import { BottomSheet } from "@/shared/ui/BottomSheet";
import { IconButton, OutlineButton, RegularButton } from "@/shared/ui/Buttons";
import { PageHeader } from "@/shared/ui/PageHeader";
import { PageWrapper } from "@/shared/ui/PageWrapper";
import { SectionCard } from "@/shared/ui/SectionCard";
import { SectionHeading } from "@/shared/ui/SectionHeading";
import { preloadLoader } from "@/shared/ui/Spinner";
import { DraftList } from "@/widgets/DraftList";

import { ImportingItem } from "./ImportingItem/ImportingItem";
import { OptionCard } from "./OptionCard/OptionCard";

import styles from "./AddRecipePage.module.scss";

// Сколько последних черновиков видно здесь, остальные на странице «Все черновики»
const DRAFTS_PREVIEW = 3;
// Когда до лимита рецептов осталось столько или меньше, предупреждаем заранее
const LIMIT_WARNING_LEFT = 5;

// Выбор способа добавления: вручную или распознать по ссылке и фото
const AddRecipePage = () => {
    const { t } = useTranslation(["recipeForm", "common"]);
    const navigate = useNavigate();
    const { data: user } = useMe({ fresh: true });
    const { data: drafts = [] } = useDrafts();
    const importing = useImportsInProgress();
    const [isAiSheetOpen, setIsAiSheetOpen] = useState(false);

    const isAiLocked = user?.aiEnabled === false;
    const isLimitReached = user?.recipeLimit != null && user.recipeCount >= user.recipeLimit;
    const isLimitNear = user?.recipeLimit != null && !isLimitReached
        && user.recipeLimit - user.recipeCount <= LIMIT_WARNING_LEFT;

    const handleImport = () => {
        if (isAiLocked) {
            setIsAiSheetOpen(true);
            return;
        }

        // Котик с лупой нужен только при распознавании: подгружаем его, пока пользователь вставляет ссылку
        preloadLoader("catMagnifier");
        navigate(AppRoute.ImportRecipe);
    };

    return (
        <PageWrapper
            className={styles.page}
            header={
                <PageHeader className={styles.header}>
                    <div>
                        <h1 className={styles.title}>{t("choose.title")}</h1>
                        <p className={styles.subtitle}>{t("choose.subtitle")}</p>
                    </div>
                    <IconButton
                        icon="back"
                        round
                        className={styles.back}
                        type="button"
                        aria-label={t("common:back")}
                        onClick={() => navigate(-1)}
                    />
                </PageHeader>
            }
        >
            {isLimitReached && (
                <p className={styles.limit} role="status">
                    <strong>{t("choose.limit.title")}</strong>
                    {t("choose.limit.text", { current: user.recipeCount, limit: user.recipeLimit })}
                </p>
            )}

            {isLimitNear && (
                <p className={styles.limit} role="status">
                    <strong>{t("choose.limitNear.title")}</strong>
                    {t("choose.limitNear.text", { current: user.recipeCount, limit: user.recipeLimit })}
                </p>
            )}

            <SectionCard
                mark="一"
                title={t("choose.methods")}
                description={t("choose.intro")}
                className={styles.methods}
            >
                <OptionCard
                    icon={<FormIcon />}
                    title={t("choose.manual.title")}
                    description={t("choose.manual.description")}
                    action={t("choose.manual.action")}
                    disabled={isLimitReached}
                    onClick={() => navigate(AppRoute.CreateRecipe)}
                />
                <OptionCard
                    icon={<ImageIcon />}
                    title={t("choose.import.title")}
                    description={t("choose.import.description")}
                    action={isAiLocked ? t("choose.locked") : t("choose.import.action")}
                    locked={isAiLocked}
                    disabled={isLimitReached}
                    onClick={handleImport}
                />
            </SectionCard>

            {(drafts.length > 0 || importing.length > 0) && (
                <section className={styles.drafts}>
                    <SectionHeading
                        title={t("drafts.title")}
                        hint={t("drafts.hint")}
                        total={String(drafts.length)}
                    />
                    <DraftList drafts={drafts.slice(0, DRAFTS_PREVIEW)}>
                        {importing.map(({ id, source }) => <ImportingItem key={id} source={source} />)}
                    </DraftList>
                    {drafts.length > DRAFTS_PREVIEW && (
                        <OutlineButton
                            type="button"
                            label={t("drafts.all", { count: drafts.length })}
                            onClick={() => navigate(AppRoute.Drafts)}
                        />
                    )}
                </section>
            )}

            <BottomSheet
                isOpen={isAiSheetOpen}
                onClose={() => setIsAiSheetOpen(false)}
                title={t("choose.aiLocked.title")}
                footer={
                    <RegularButton
                        type="button"
                        label={t("choose.aiLocked.action")}
                        onClick={() => navigate(AppRoute.CreateRecipe, { replace: true })}
                    />
                }
            >
                <p className={styles.sheetText}>{t("choose.aiLocked.text")}</p>
            </BottomSheet>
        </PageWrapper>
    );
};

export default AddRecipePage;
