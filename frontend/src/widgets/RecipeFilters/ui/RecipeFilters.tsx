import { type Dispatch, memo, type SetStateAction, useState } from 'react';

import { Category, Tag } from '@recipe/common';

import { getCategoryIcon } from '@/entities/category';
import { GetRecipesProps } from '@/entities/recipe/types';
import { BottomSheet } from '@/shared/ui/BottomSheet';
import { IconButton, OutlineButton } from '@/shared/ui/Buttons';
import { CategoryComponent } from '@/shared/ui/CategoryComponent';
import { SearchInput } from '@/shared/ui/Input';
import { TagComponent } from '@/shared/ui/Tag';

import styles from './RecipeFilters.module.scss';

interface RecipeFiltersProps {
    categories: Category[];
    tags: Tag[];
    filters: GetRecipesProps;
    setFilters: Dispatch<SetStateAction<GetRecipesProps>>;
}

const RecipeFilters = (props: RecipeFiltersProps) => {
    const {categories, tags, filters, setFilters} = props;
    const [isOpen, setIsOpen] = useState(false);

    const activeCount = (filters.categoryId ? 1 : 0) + (filters.tagIds?.length ?? 0);

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
        <article className={styles.filters}>
            <div className={styles.bar}>
                <SearchInput
                    value={filters.search ?? ""}
                    onChange={handleSearchChange}
                    placeholder="Поиск рецептов..."
                />

                <div className={styles.trigger}>
                    <IconButton
                        icon="filter"
                        variant={activeCount > 0 ? "active" : "default"}
                        onClick={() => setIsOpen(true)}
                        aria-label="Открыть фильтры"
                    />
                    {activeCount > 0 && <span className={styles.badge}>{activeCount}</span>}
                </div>
            </div>

            <BottomSheet
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
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
                    <h3 className={styles.sectionTitle}>Категории</h3>
                    <div className={styles.categories}>
                        {categories.map((category) => {
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
                        })}
                    </div>
                </section>

                <section className={styles.section}>
                    <h3 className={styles.sectionTitle}>Теги</h3>
                    <div className={styles.tags}>
                        {tags.map((tag) => {
                            const isSelected = filters.tagIds?.includes(tag.id) ?? false;

                            return (
                                <TagComponent key={tag.id} tag={tag} clickHandler={handleTagToggle} tagIsActive={isSelected} />
                            );
                        })}
                    </div>
                </section>
            </BottomSheet>
        </article>
    );
};

export default memo(RecipeFilters);
