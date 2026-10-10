import { type Dispatch, memo, type Ref, type SetStateAction } from 'react';

import type { Category, Tag } from '@recipe/common';

import { getCategoryIcon } from '@/entities/category';
import type { GetRecipesProps } from '@/entities/recipe/types';
import { BottomSheet } from '@/shared/ui/BottomSheet';
import { OutlineButton } from '@/shared/ui/Buttons';
import { CategoryComponent } from '@/shared/ui/CategoryComponent';
import { ExpandableList } from '@/shared/ui/ExpandableList';
import { SearchInput } from '@/shared/ui/Input';
import { TagComponent } from '@/shared/ui/Tag';

import { getActiveFilterCount } from '../lib/getActiveFilterCount';
import { FilterButton } from './FilterButton/FilterButton';

import styles from './RecipeFilters.module.scss';

// Сколько рядов категорий и тегов видно в свёрнутом фильтре
const COLLAPSED_ROWS = 2;

interface RecipeFiltersProps {
    categories: Category[];
    tags: Tag[];
    filters: GetRecipesProps;
    setFilters: Dispatch<SetStateAction<GetRecipesProps>>;
    // Шторка фильтров управляется снаружи: её открывает и кнопка в шапке страницы
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    // Поиск и кнопка фильтров неактивны, пока грузится список
    disabled?: boolean;
    ref?: Ref<HTMLElement>;
}

const RecipeFilters = (props: RecipeFiltersProps) => {
    const {categories, tags, filters, setFilters, isOpen, onOpenChange, disabled, ref} = props;

    const activeCount = getActiveFilterCount(filters);

    const handleSearchChange = (search: string) => {
        setFilters((prev) => ({
            ...prev,
            search: search || undefined,
        }));
    };

    const handleCategoryChange = (categoryId: string | undefined) => {
        setFilters((prev) => ({
            ...prev,
            categoryId,
        }));
    };

    const handleTagToggle = (tagId: string) => {
        setFilters((prev) => {
            const currentTagIds = prev.tagIds ?? [];

            const isSelected = currentTagIds.includes(tagId);

            const tagIds = isSelected
                ? currentTagIds.filter((id) => id !== tagId)
                : [...currentTagIds, tagId];

            return {
                ...prev,
                tagIds: tagIds.length > 0 ? tagIds : undefined,
            };
        });
    };

    const handleReset = () => {
        setFilters((prev) => ({ search: prev.search }));
    };

    return (
        <article ref={ref}>
            <div className={styles.bar}>
                <SearchInput
                    value={filters.search ?? ""}
                    onChange={handleSearchChange}
                    placeholder="Поиск рецептов..."
                    disabled={disabled}
                />

                <FilterButton
                    activeCount={activeCount}
                    onClick={() => onOpenChange(true)}
                    disabled={disabled}
                />
            </div>

            <BottomSheet
                isOpen={isOpen}
                onClose={() => onOpenChange(false)}
                title="Фильтры"
                footer={
                    <OutlineButton
                        label="Сбросить"
                        className={styles.action}
                        onClick={handleReset}
                        disabled={activeCount === 0}
                    />
                }
            >
                <section className={styles.section}>
                    <h3 className={styles.sectionTitle}>Поиск</h3>
                    <SearchInput
                        value={filters.search ?? ""}
                        onChange={handleSearchChange}
                        placeholder="Поиск рецептов..."
                    />
                </section>

                <section className={styles.section}>
                    <h3 className={styles.sectionTitle}>Категории</h3>
                    <ExpandableList
                        items={categories}
                        rows={COLLAPSED_ROWS}
                        isPinned={(category) => filters.categoryId === category.id}
                        className={styles.categories}
                        renderItem={(category) => {
                            const Icon = getCategoryIcon(category.iconName);

                            return (
                                <CategoryComponent
                                    key={category.id}
                                    label={category.name}
                                    icon={<Icon />}
                                    isActive={filters.categoryId === category.id}
                                    onClick={() =>
                                        handleCategoryChange(
                                            filters.categoryId === category.id
                                                ? undefined
                                                : category.id
                                        )
                                    }
                                />
                            );
                        }}
                    />
                </section>

                <section className={styles.section}>
                    <h3 className={styles.sectionTitle}>Теги</h3>
                    <ExpandableList
                        items={tags}
                        rows={COLLAPSED_ROWS}
                        isPinned={(tag) => filters.tagIds?.includes(tag.id) ?? false}
                        className={styles.tags}
                        renderItem={(tag) => (
                            <TagComponent
                                key={tag.id}
                                tag={tag}
                                clickHandler={handleTagToggle}
                                tagIsActive={filters.tagIds?.includes(tag.id) ?? false}
                            />
                        )}
                    />
                </section>
            </BottomSheet>
        </article>
    );
};

export default memo(RecipeFilters);
