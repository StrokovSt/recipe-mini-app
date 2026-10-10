import type { GetRecipesProps } from '@/entities/recipe/types';

// Совпадают ли фильтры (порядок тегов не важен)
export const isSameFilters = (a: GetRecipesProps, b: GetRecipesProps) => {
    const aTagIds = a.tagIds ?? [];
    const bTagIds = b.tagIds ?? [];

    return (
        (a.search ?? '') === (b.search ?? '') &&
        a.categoryId === b.categoryId &&
        aTagIds.length === bTagIds.length &&
        aTagIds.every((id) => bTagIds.includes(id))
    );
};
