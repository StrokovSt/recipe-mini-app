import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { AppRoute } from "@/app/router";
import { useDrafts } from "@/entities/draft";
import { useMe } from "@/entities/user";
import { useImportsInProgress } from "@/features/recipe-form";
import FormIcon from "@/shared/assets/icons/icon-form.svg?react";
import ImageIcon from "@/shared/assets/icons/icon-image.svg?react";
import { useLayoutMode } from "@/shared/lib/layout";
import { BottomSheet } from "@/shared/ui/BottomSheet";
import { Breadcrumbs } from "@/shared/ui/Breadcrumbs";
import { IconButton, OutlineButton, RegularButton } from "@/shared/ui/Buttons";
import { PageHeader } from "@/shared/ui/PageHeader";
import { PageTitle } from "@/shared/ui/PageTitle";
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
    const { t } = useTranslation(["recipeForm", "common", "footer"]);
    const navigate = useNavigate();
    const mode = useLayoutMode();
    const isDesktop = mode === "desktop" || mode === "wide";
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

    // Две карточки способов: вручную (винная) и распознать (зелёная)
    const options = (
        <>
            <OptionCard
                tone="manual"
                icon={<FormIcon />}
                title={t("choose.manual.title")}
                description={t("choose.manual.description")}
                action={t("choose.manual.action")}
                disabled={isLimitReached}
                onClick={() => navigate(AppRoute.CreateRecipe)}
            />
            <OptionCard
                tone="import"
                icon={<ImageIcon />}
                title={t("choose.import.title")}
                description={t("choose.import.description")}
                action={isAiLocked ? t("choose.locked") : t("choose.import.action")}
                locked={isAiLocked}
                disabled={isLimitReached}
                onClick={handleImport}
            />
        </>
    );

    return (
        <PageWrapper
            className={styles.page}
            header={
                isDesktop ? (
                    <PageHeader>
                        <Breadcrumbs
                            label={t("common:breadcrumbs")}
                            items={[
                                { label: t("footer:collection"), to: AppRoute.Home },
                                { label: t("choose.title") },
                            ]}
                        />
                    </PageHeader>
                ) : (
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
                )
            }
        >
            {/* Компьютер: заголовок в контенте, как на главной и в разделах */}
            {isDesktop && <PageTitle title={t("choose.title")} hint={t("choose.subtitle")} />}

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

            {/* Компьютер: две большие карточки рядом, без общей рамки. Телефон: в карточке раздела одна под другой */}
            {isDesktop ? (
                <div className={styles.options}>{options}</div>
            ) : (
                <SectionCard
                    mark="一"
                    title={t("choose.methods")}
                    description={t("choose.intro")}
                    className={styles.methods}
                >
                    {options}
                </SectionCard>
            )}

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
                            className={styles.allDrafts}
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
