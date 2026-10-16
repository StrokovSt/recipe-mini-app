import { AnimatePresence, motion } from 'motion/react';
import { type Dispatch, type SetStateAction, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { useCategories } from "@/entities/category";
import { useRecipes } from '@/entities/recipe';
import type { GetRecipesProps } from '@/entities/recipe/types';
import { useTags } from '@/entities/tag';
import { TRANSITION_BASE } from '@/shared/config/animation';
import { useIsHiddenBehind } from '@/shared/lib/hooks';
import { useLoader } from '@/shared/ui/GlobalLoader';
import { PageHeader, usePageHeaderBar } from '@/shared/ui/PageHeader';
import { PageWrapper } from '@/shared/ui/PageWrapper';
import { FilterButton, getActiveFilterCount, RecipeFilters } from '@/widgets/RecipeFilters';
import { RecipeList } from '@/widgets/RecipeList';

import { HomeHeading } from './HomeHeading/HomeHeading';

import styles from './HomePage.module.scss';

const HIDDEN = { opacity: 0, scale: 0.6 };
const VISIBLE = { opacity: 1, scale: 1 };

const HomePage = () => {
    // Категория и теги живут в адресе (на главную ведут плитки разделов), поиск — в состоянии
    const [searchParams, setSearchParams] = useSearchParams();
    const [search, setSearch] = useState<string>();

    const filters = useMemo<GetRecipesProps>(() => {
        const tagIds = searchParams.getAll('tag');

        return {
            search,
            categoryId: searchParams.get('category') ?? undefined,
            tagIds: tagIds.length > 0 ? tagIds : undefined,
        };
    }, [search, searchParams]);

    const setFilters: Dispatch<SetStateAction<GetRecipesProps>> = (action) => {
        const next = typeof action === 'function' ? action(filters) : action;
        const params = new URLSearchParams();

        if (next.categoryId) params.set('category', next.categoryId);
        next.tagIds?.forEach((id) => params.append('tag', id));

        setSearch(next.search);
        if (params.toString() !== searchParams.toString()) setSearchParams(params, { replace: true });
    };
    const [isFiltersOpen, setIsFiltersOpen] = useState(false);
    const { data: recipes = [], isLoading } = useRecipes(filters);
    const { data: categories = [] } = useCategories();
    const { data: tags = [] } = useTags();

    // Когда поиск с фильтрами уходит под шапку, кнопка фильтров появляется в шапке
    const headerBar = usePageHeaderBar();
    const filtersRef = useRef<HTMLElement>(null);
    const isFiltersHidden = useIsHiddenBehind(filtersRef, headerBar);

    // Первая загрузка списка: страница ждёт за глобальным котиком. Смена фильтров котика не зовёт (keepPreviousData)
    useLoader(isLoading);
    if (isLoading) return null;

    return (
        <PageWrapper
            header={
                <PageHeader>
                    <HomeHeading
                        actions={
                            <AnimatePresence initial={false}>
                                {isFiltersHidden && (
                                    <motion.div
                                        initial={HIDDEN}
                                        animate={VISIBLE}
                                        exit={HIDDEN}
                                        transition={TRANSITION_BASE}
                                    >
                                        <FilterButton
                                            round
                                            className={styles.filterButton}
                                            activeCount={getActiveFilterCount(filters)}
                                            onClick={() => setIsFiltersOpen(true)}
                                        />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        }
                    />
                </PageHeader>
            }
        >
            <RecipeFilters
                ref={filtersRef}
                categories={categories}
                tags={tags}
                setFilters={setFilters}
                filters={filters}
                isOpen={isFiltersOpen}
                onOpenChange={setIsFiltersOpen}
            />
            <RecipeList recipes={recipes} />
        </PageWrapper>
    );
};

export default HomePage;
