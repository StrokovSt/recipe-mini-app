import type { Dispatch, SetStateAction } from "react";
import { useTranslation } from "react-i18next";

import type { Tag } from "@recipe/common";

import type { GetRecipesProps } from "@/entities/recipe/types";
import { ExpandableList } from "@/shared/ui/ExpandableList";
import { TagComponent } from "@/shared/ui/Tag";

import styles from "./TagStrip.module.scss";

// Сколько рядов тегов видно, пока список свёрнут
const COLLAPSED_ROWS = 1;

interface TagStripProps {
    tags: Tag[];
    filters: GetRecipesProps;
    setFilters: Dispatch<SetStateAction<GetRecipesProps>>;
}

// Компьютер: все теги под категориями. Нажатие сразу включает или выключает тег в фильтре.
// Видно по одному ряду, остальные по «Показать ещё», выбранные теги всегда на виду
export function TagStrip(props: TagStripProps) {
    const { tags, filters, setFilters } = props;
    const { t } = useTranslation("home");

    const isSelected = (tag: Tag) => filters.tagIds?.includes(tag.id) ?? false;

    const handleToggle = (tagId: string) => {
        setFilters((prev) => {
            const current = prev.tagIds ?? [];
            const tagIds = current.includes(tagId) ? current.filter((id) => id !== tagId) : [...current, tagId];

            return { ...prev, tagIds: tagIds.length > 0 ? tagIds : undefined };
        });
    };

    if (tags.length === 0) return null;

    return (
        <nav aria-label={t("tags")}>
            <ExpandableList
                items={tags}
                rows={COLLAPSED_ROWS}
                isPinned={isSelected}
                className={styles.list}
                renderItem={(tag) => (
                    <TagComponent key={tag.id} tag={tag} tagIsActive={isSelected(tag)} clickHandler={handleToggle} />
                )}
            />
        </nav>
    );
}
