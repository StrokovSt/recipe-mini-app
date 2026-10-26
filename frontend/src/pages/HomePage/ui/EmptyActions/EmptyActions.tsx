import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { AppRoute } from "@/app/router";
import { useMe } from "@/entities/user";
import FormIcon from "@/shared/assets/icons/icon-form.svg?react";
import { OutlineButton, RegularButton } from "@/shared/ui/Buttons";
import { preloadLoader } from "@/shared/ui/Spinner";

import styles from "./EmptyActions.module.scss";

// Пустая коллекция: два способа добавить первый рецепт прямо отсюда, те же, что на странице «Новый рецепт»
export const EmptyActions = () => {
    const { t } = useTranslation("home");
    const navigate = useNavigate();
    const { data: user } = useMe();

    const handleImport = () => {
        // Распознавание выключено: на странице «Новый рецепт» это объяснено
        if (user?.aiEnabled === false) {
            navigate(AppRoute.AddRecipe);
            return;
        }

        preloadLoader("catMagnifier");
        navigate(AppRoute.ImportRecipe);
    };

    return (
        <div className={styles.actions}>
            <RegularButton
                type="button"
                className={styles.button}
                icon="link"
                label={t("empty.import")}
                onClick={handleImport}
            />
            <OutlineButton
                type="button"
                className={styles.button}
                label={t("empty.manual")}
                onClick={() => navigate(AppRoute.CreateRecipe)}
            >
                <FormIcon />
                {t("empty.manual")}
            </OutlineButton>
        </div>
    );
};
