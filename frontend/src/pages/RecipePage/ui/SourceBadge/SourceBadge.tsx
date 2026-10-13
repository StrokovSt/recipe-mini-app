import clsx from "clsx";
import { useTranslation } from "react-i18next";

import type { RecipeSourceInfo } from "@/entities/recipe";
import ForwardIcon from "@/shared/assets/icons/icon-forward.svg?react";

import styles from "./SourceBadge.module.scss";

interface SourceBadgeProps {
    source: RecipeSourceInfo;
    className?: string;
}

// Плашка «откуда рецепт»: иконка площадки и название, по тапу открывается оригинал
export function SourceBadge(props: SourceBadgeProps) {
    const { source, className } = props;
    const { label, Icon, url } = source;
    const { t } = useTranslation("recipe");

    if (!url) {
        return (
            <span className={clsx(styles.badge, className)}>
                <Icon />
                {label}
            </span>
        );
    }

    return (
        <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className={clsx(styles.badge, styles.link, className)}
            aria-label={`${t("source")}: ${label}`}
        >
            <Icon />
            {label}
            <ForwardIcon className={styles.arrow} />
        </a>
    );
}
