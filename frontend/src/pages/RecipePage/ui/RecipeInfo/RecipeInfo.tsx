import clsx from "clsx";
import { useLayoutEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import type { Tag } from "@recipe/common";

import ClockIcon from "@/shared/assets/icons/icon-clock.svg?react";
import { IconLabel } from "@/shared/ui/IconLabel";
import { TagComponent } from "@/shared/ui/Tag";

import styles from "./RecipeInfo.module.scss";

interface RecipeInfoProps {
    title: string;
    category: string;
    description: string | null;
    // Общее время в минутах
    time: number;
    tags: Tag[];
}

// Под обложкой: категория, название, описание, время и теги.
// Длинное описание свёрнуто до трёх строк, чтобы не отодвигать ингредиенты
export function RecipeInfo(props: RecipeInfoProps) {
    const { title, category, description, time, tags } = props;
    const { t } = useTranslation(["recipe", "common"]);
    const descriptionRef = useRef<HTMLParagraphElement>(null);
    const [isExpanded, setIsExpanded] = useState(false);
    const [isClamped, setIsClamped] = useState(false);

    // Кнопка нужна, только если текст правда обрезан
    useLayoutEffect(() => {
        const element = descriptionRef.current;
        if (element && !isExpanded) setIsClamped(element.scrollHeight > element.clientHeight);
    }, [description, isExpanded]);

    return (
        <div className={styles.info}>
            <span className={styles.category}>{category}</span>
            <h1 className={styles.title}>{title}</h1>

            {description && (
                <div className={styles.descriptionWrap}>
                    <p ref={descriptionRef} className={clsx(styles.description, !isExpanded && styles.clamped)}>
                        {description}
                    </p>
                    {isClamped && (
                        <button type="button" className={styles.more} onClick={() => setIsExpanded(!isExpanded)}>
                            {isExpanded ? t("common:collapse") : t("more")}
                        </button>
                    )}
                </div>
            )}

            {time > 0 && (
                <div className={styles.chips}>
                    <IconLabel icon={<ClockIcon />} className={styles.chip}>
                        {t("common:minutes", { count: time })}
                    </IconLabel>
                </div>
            )}

            {tags.length > 0 && (
                <div className={styles.tags}>
                    {tags.map((tag) => (
                        <TagComponent key={tag.id} tag={tag} />
                    ))}
                </div>
            )}
        </div>
    );
}
