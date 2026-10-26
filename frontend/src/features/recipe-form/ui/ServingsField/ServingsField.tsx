import { useId } from "react";
import { useTranslation } from "react-i18next";

import { IconButton } from "@/shared/ui/Buttons";

import styles from "./ServingsField.module.scss";

const MIN_SERVINGS = 1;
const MAX_SERVINGS = 99;

interface ServingsFieldProps {
    value: number;
    onChange: (value: number) => void;
}

// Порции кнопками «−» и «+», как счётчик на странице рецепта. Выглядит как поле «строкой» рядом со временем:
// подпись мелко сверху, как поднятая подпись поля, под ней число между кнопками и линия
const ServingsField = ({ value, onChange }: ServingsFieldProps) => {
    const { t } = useTranslation(["recipeForm", "common"]);
    const labelId = useId();

    return (
        <div className={styles.field} role="group" aria-labelledby={labelId}>
            <span id={labelId} className={styles.label}>{t("recipe.servings")}</span>
            <IconButton
                icon="minus"
                variant="empty"
                type="button"
                className={styles.button}
                aria-label={t("common:decrease")}
                disabled={value <= MIN_SERVINGS}
                onClick={() => onChange(value - 1)}
            />
            <output className={styles.value} aria-live="polite">{value}</output>
            <IconButton
                icon="add"
                variant="empty"
                type="button"
                className={styles.button}
                aria-label={t("common:increase")}
                disabled={value >= MAX_SERVINGS}
                onClick={() => onChange(value + 1)}
            />
        </div>
    );
};

export default ServingsField;
