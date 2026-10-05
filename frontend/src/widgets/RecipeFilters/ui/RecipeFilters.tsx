import React, { Dispatch, memo, SetStateAction } from 'react';

import { Category, Tag } from '@recipe/common';

import { GetRecipesProps } from '@/entities/recipe/types';
import { TagComponent } from '@/shared/ui/Tag';

interface RecipeFiltersProps {
    categories: Category[];
    tags: Tag[];
    filters: GetRecipesProps;
    setFilters: Dispatch<SetStateAction<GetRecipesProps>>;
}

const RecipeFilters = (props: RecipeFiltersProps) => {
    const {categories, tags, filters, setFilters} = props;

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
        setFilters({});
    };

    return (
        <article>
            <input
                type="search"
                value={filters.search ?? ""}
                onChange={(event) => handleSearchChange(event.target.value)}
                placeholder="Поиск рецептов..."
            />

            <div>
                {categories.map((category) => (
                    <button
                        key={category.id}
                        type="button"
                        onClick={() =>
                            handleCategoryChange(
                                filters.categoryId === category.id
                                    ? undefined
                                    : category.id
                            )
                        }
                    >
                        {category.name}
                    </button>
                ))}
            </div>

            <div>
                {tags.map((tag) => {
                    const isSelected = filters.tagIds?.includes(tag.id) ?? false;

                    return (
                        <TagComponent key={tag.id} tag={tag} clickHandler={handleTagToggle} tagIsActive={isSelected} />
                    );
                })}
            </div>

            <button
                type="button"
                onClick={handleReset}
            >
                Сбросить
            </button>
        </article>
    );
};

export default memo(RecipeFilters);