import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import type { DraftSummary } from "@recipe/common";
import { DRAFT_LIMIT } from "@recipe/common";

import { AppRoute } from "@/app/router";
import { buildRoute } from "@/app/router/routes";
import { DraftItem, useDeleteDraft, useDrafts } from "@/entities/draft";
import { useMe } from "@/entities/user";
import FormIcon from "@/shared/assets/icons/icon-form.svg?react";
import ImageIcon from "@/shared/assets/icons/icon-image.svg?react";
import { BottomSheet } from "@/shared/ui/BottomSheet";
import { IconButton, RegularButton } from "@/shared/ui/Buttons";
import { ConfirmModal } from "@/shared/ui/Modal";
import { PageHeader } from "@/shared/ui/PageHeader";
import { PageWrapper } from "@/shared/ui/PageWrapper";
import { SectionCard } from "@/shared/ui/SectionCard";
import { SectionHeading } from "@/shared/ui/SectionHeading";

import { OptionCard } from "./OptionCard/OptionCard";

import styles from "./AddRecipePage.module.scss";

// Выбор способа добавления: вручную или распознать по ссылке и фото
const AddRecipePage = () => {
    const { t } = useTranslation(["recipeForm", "common"]);
    const navigate = useNavigate();
    const { data: user } = useMe({ fresh: true });
    const { data: drafts = [] } = useDrafts();
    const { mutate: removeDraft } = useDeleteDraft();
    const [isAiSheetOpen, setIsAiSheetOpen] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    // Не сбрасываем при закрытии, иначе заголовок окна меняется во время анимации
    const [deletingDraft, setDeletingDraft] = useState<DraftSummary | null>(null);

    const isAiLocked = user?.aiEnabled === false;
    const isLimitReached = user?.recipeLimit != null && user.recipeCount >= user.recipeLimit;
    // Новый рецепт начинается с черновика, поэтому при полном списке черновиков начать нельзя
    const isDraftLimitReached = drafts.length >= DRAFT_LIMIT;
    const isDisabled = isLimitReached || isDraftLimitReached;

    const askDelete = (draft: DraftSummary) => {
        setDeletingDraft(draft);
        setIsConfirmOpen(true);
    };

    const closeConfirm = () => setIsConfirmOpen(false);

    const confirmDelete = () => {
        if (deletingDraft) removeDraft(deletingDraft.id);
        closeConfirm();
    };

    const handleImport = () => {
        if (isAiLocked) {
            setIsAiSheetOpen(true);
            return;
        }

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

            {!isLimitReached && isDraftLimitReached && (
                <p className={styles.limit} role="status">
                    <strong>{t("drafts.limit.title")}</strong>
                    {t("drafts.limit.text", { count: drafts.length, limit: DRAFT_LIMIT })}
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
                    disabled={isDisabled}
                    onClick={() => navigate(AppRoute.CreateRecipe)}
                />
                <OptionCard
                    icon={<ImageIcon />}
                    title={t("choose.import.title")}
                    description={t("choose.import.description")}
                    action={isAiLocked ? t("choose.locked") : t("choose.import.action")}
                    locked={isAiLocked}
                    disabled={isDisabled}
                    onClick={handleImport}
                />
            </SectionCard>

            <p className={styles.saved}>{t("choose.saved")}</p>

            {drafts.length > 0 && (
                <section className={styles.drafts}>
                    <SectionHeading
                        title={t("drafts.title")}
                        hint={t("drafts.hint")}
                        total={t("drafts.total", { count: drafts.length, limit: DRAFT_LIMIT })}
                    />
                    <div className={styles.draftList}>
                        {drafts.map((draft) => (
                            <DraftItem
                                key={draft.id}
                                draft={draft}
                                to={buildRoute.draft(draft.id)}
                                onDelete={askDelete}
                            />
                        ))}
                    </div>
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
                        onClick={() => navigate(AppRoute.CreateRecipe)}
                    />
                }
            >
                <p className={styles.sheetText}>{t("choose.aiLocked.text")}</p>
            </BottomSheet>

            <ConfirmModal
                isOpen={isConfirmOpen}
                onClose={closeConfirm}
                onConfirm={confirmDelete}
                title={t("drafts.deleteTitle", { name: deletingDraft?.title || t("drafts.untitled") })}
                text={t("drafts.deleteText")}
            />
        </PageWrapper>
    );
};

export default AddRecipePage;
