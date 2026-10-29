import clsx from "clsx";
import type { Dispatch, SetStateAction } from "react";
import { useTranslation } from "react-i18next";

import type { Category } from "@recipe/common";

import { getCategoryIcon, getCategoryIconName } from "@/entities/category";
import type { GetRecipesProps } from "@/entities/recipe/types";
import CollectionIcon from "@/shared/assets/icons/icon-collection.svg?react";
import { ExpandableList } from "@/shared/ui/ExpandableList";

import styles from "./CategoryStrip.module.scss";

// Сколько рядов категорий видно, пока список свёрнут
const COLLAPSED_ROWS = 1;

interface CategoryStripProps {
    categories: Category[];
    filters: GetRecipesProps;
    setFilters: Dispatch<SetStateAction<GetRecipesProps>>;
}

// Компьютер: категории плитками под заголовком, первая — «Все рецепты». Видно по одному ряду,
// остальные по «Показать ещё», выбранная категория всегда на виду. Нажатие меняет только категорию, поиск и теги остаются
export function CategoryStrip(props: CategoryStripProps) {
    const { categories, filters, setFilters } = props;
    const { t } = useTranslation("home");

    // У каждого рецепта одна категория: сумма — все рецепты
    const total = categories.reduce((sum, category) => sum + (category.recipeCount ?? 0), 0);
    const select = (categoryId?: string) => setFilters((prev) => ({ ...prev, categoryId }));

    return (
        <nav aria-label={t("categories")}>
            <ExpandableList
                items={categories}
                rows={COLLAPSED_ROWS}
                isPinned={(category) => filters.categoryId === category.id}
                className={styles.strip}
                leading={
                    <button
                        type="button"
                        className={clsx(styles.item, styles.all, !filters.categoryId && styles.active)}
                        aria-pressed={!filters.categoryId}
                        onClick={() => select(undefined)}
                    >
                        <span className={styles.picture}>
                            <CollectionIcon />
                        </span>
                        <span className={styles.text}>
                            <span className={styles.name}>{t("allRecipes")}</span>
                            <span className={styles.count}>{t("recipeCount", { count: total })}</span>
                        </span>
                    </button>
                }
                renderItem={(category) => {
                    const Icon = getCategoryIcon(category.iconName);
                    const count = category.recipeCount ?? 0;
                    const isActive = filters.categoryId === category.id;

                    return (
                        <button
                            key={category.id}
                            type="button"
                            className={clsx(
                                styles.item,
                                styles[getCategoryIconName(category.iconName).toLowerCase()],
                                isActive && styles.active
                            )}
                            aria-pressed={isActive}
                            onClick={() => select(isActive ? undefined : category.id)}
                        >
                            <span className={styles.picture}>
                                <Icon />
                            </span>
                            <span className={styles.text}>
                                <span className={styles.name}>{category.name}</span>
                                <span className={styles.count}>
                                    {count > 0 ? t("recipeCount", { count }) : t("noRecipes")}
                                </span>
                            </span>
                        </button>
                    );
                }}
            />
        </nav>
    );
}
