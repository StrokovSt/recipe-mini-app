import { useTranslation } from "react-i18next";

import type { ImportSource } from "@/features/recipe-form";
import ImageIcon from "@/shared/assets/icons/icon-image.svg?react";

import styles from "./ImportingItem.module.scss";

interface ImportingItemProps {
    source: ImportSource;
}

// Рецепт, который сейчас распознаётся: строка как у черновика, но без ссылки и действий.
// Когда распознавание закончится, на её месте появится сам черновик
export const ImportingItem = (props: ImportingItemProps) => {
    const { source } = props;
    const { t } = useTranslation("recipeForm");
    // Откуда рецепт: сайт из ссылки или имя файла
    const from = "file" in source ? source.file.name : new URL(source.url).hostname.replace(/^www\./, "");

    return (
        <article className={styles.item} aria-busy>
            <ImageIcon className={styles.icon} aria-hidden />
            <p className={styles.title}>{t("import.loading")}</p>
            <p className={styles.subtitle}>{from}</p>
        </article>
    );
};
