import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { AppRoute } from "@/app/router";
import { useMe } from "@/entities/user";
import FormIcon from "@/shared/assets/icons/icon-form.svg?react";
import ImageIcon from "@/shared/assets/icons/icon-image.svg?react";
import { BottomSheet } from "@/shared/ui/BottomSheet";
import { IconButton, RegularButton } from "@/shared/ui/Buttons";
import { PageHeader } from "@/shared/ui/PageHeader";
import { PageWrapper } from "@/shared/ui/PageWrapper";

import { OptionCard } from "./OptionCard/OptionCard";

import styles from "./AddRecipePage.module.scss";

// Выбор способа добавления: вручную или распознать по ссылке и фото
const AddRecipePage = () => {
    const { t } = useTranslation(["recipeForm", "common"]);
    const navigate = useNavigate();
    const { data: user } = useMe({ fresh: true });
    const [isAiSheetOpen, setIsAiSheetOpen] = useState(false);

    const isAiLocked = user?.aiEnabled === false;
    const isLimitReached = user?.recipeLimit != null && user.recipeCount >= user.recipeLimit;

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
            <p className={styles.intro}>{t("choose.intro")}</p>

            {isLimitReached && (
                <p className={styles.limit} role="status">
                    <strong>{t("choose.limit.title")}</strong>
                    {t("choose.limit.text", { current: user.recipeCount, limit: user.recipeLimit })}
                </p>
            )}

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
                accent
                locked={isAiLocked}
                disabled={isLimitReached}
                onClick={handleImport}
            />

            <p className={styles.saved}>{t("choose.saved")}</p>

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
        </PageWrapper>
    );
};

export default AddRecipePage;
