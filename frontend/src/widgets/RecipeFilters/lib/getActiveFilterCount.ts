import type { GetRecipesProps } from '@/entities/recipe/types';

// Сколько фильтров включено (поиск не считается)
export const getActiveFilterCount = (filters: GetRecipesProps) =>
    (filters.categoryId ? 1 : 0) + (filters.tagIds?.length ?? 0);
