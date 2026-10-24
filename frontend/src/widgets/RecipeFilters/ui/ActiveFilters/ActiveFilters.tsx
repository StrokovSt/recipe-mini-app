import { AnimatePresence, m } from 'motion/react';
import type { Dispatch, SetStateAction } from 'react';
import { useTranslation } from 'react-i18next';

import type { Category, Tag } from '@recipe/common';

import { getCategoryIcon } from '@/entities/category';
import type { GetRecipesProps } from '@/entities/recipe/types';
import CloseIcon from '@/shared/assets/icons/icon-close.svg?react';
import { TRANSITION_BASE } from '@/shared/config/animation';

import styles from './ActiveFilters.module.scss';

// С какого числа фильтров в конце ряда появляется «Сбросить всё»
const CLEAR_ALL_MIN_COUNT = 2;

const COLLAPSED = { height: 0, opacity: 0 };
const EXPANDED = { height: 'auto', opacity: 1 };
const CHIP_HIDDEN = { opacity: 0, scale: 0.8 };
const CHIP_VISIBLE = { opacity: 1, scale: 1 };

interface ActiveFiltersProps {
    categories: Category[];
    tags: Tag[];
    filters: GetRecipesProps;
    setFilters: Dispatch<SetStateAction<GetRecipesProps>>;
}

// Применённые категория и теги под поиском: нажатие на чипс сразу убирает фильтр
const ActiveFilters = (props: ActiveFiltersProps) => {
    const { categories, tags, filters, setFilters } = props;
    const { t } = useTranslation('filters');

    const category = categories.find(({ id }) => id === filters.categoryId);
    // Теги в порядке выбора
    const selectedTags = (filters.tagIds ?? []).flatMap((tagId) => tags.filter(({ id }) => id === tagId));
    const count = (category ? 1 : 0) + selectedTags.length;
    const CategoryIcon = category && getCategoryIcon(category.iconName);

    const handleCategoryRemove = () => {
        setFilters((prev) => ({ ...prev, categoryId: undefined }));
    };

    const handleTagRemove = (tagId: string) => {
        setFilters((prev) => {
            const tagIds = prev.tagIds?.filter((id) => id !== tagId) ?? [];

            return { ...prev, tagIds: tagIds.length > 0 ? tagIds : undefined };
        });
    };

    // Поиск остаётся: он виден в поле над рядом
    const handleClearAll = () => {
        setFilters((prev) => ({ search: prev.search }));
    };

    const chipMotion = {
        layout: 'position' as const,
        initial: CHIP_HIDDEN,
        animate: CHIP_VISIBLE,
        exit: CHIP_HIDDEN,
        transition: TRANSITION_BASE,
    };

    return (
        <AnimatePresence initial={false}>
            {count > 0 && (
                <m.div
                    className={styles.collapse}
                    initial={COLLAPSED}
                    animate={EXPANDED}
                    exit={COLLAPSED}
                    transition={TRANSITION_BASE}
                >
                    <div className={styles.list}>
                        <AnimatePresence mode="popLayout" initial={false}>
                            {category && CategoryIcon && (
                                <m.button
                                    key={category.id}
                                    type="button"
                                    className={styles.chip}
                                    aria-label={t('removeFilter', { name: category.name })}
                                    onClick={handleCategoryRemove}
                                    {...chipMotion}
                                >
                                    <CategoryIcon className={styles.icon} aria-hidden />
                                    <span className={styles.label}>{category.name}</span>
                                    <CloseIcon className={styles.remove} aria-hidden />
                                </m.button>
                            )}

                            {selectedTags.map((tag) => (
                                <m.button
                                    key={tag.id}
                                    type="button"
                                    className={styles.chip}
                                    aria-label={t('removeFilter', { name: tag.name })}
                                    onClick={() => handleTagRemove(tag.id)}
                                    {...chipMotion}
                                >
                                    <span className={styles.label}>#{tag.name}</span>
                                    <CloseIcon className={styles.remove} aria-hidden />
                                </m.button>
                            ))}

                            {count >= CLEAR_ALL_MIN_COUNT && (
                                <m.button
                                    key="clear-all"
                                    type="button"
                                    className={`${styles.chip} ${styles['chip--clear']}`}
                                    onClick={handleClearAll}
                                    {...chipMotion}
                                >
                                    {t('clearAll')}
                                </m.button>
                            )}
                        </AnimatePresence>
                    </div>
                </m.div>
            )}
        </AnimatePresence>
    );
};

export default ActiveFilters;
