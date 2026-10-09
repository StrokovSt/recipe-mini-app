import { AnimatePresence, motion } from 'motion/react';
import { useRef, useState } from 'react';

import { useCategories } from "@/entities/category";
import { useRecipes } from '@/entities/recipe';
import type { GetRecipesProps } from '@/entities/recipe/types';
import { useTags } from '@/entities/tag';
import { TRANSITION_BASE } from '@/shared/config/animation';
import { useIsHiddenBehind } from '@/shared/lib/hooks';
import { PageHeader } from '@/shared/ui/PageHeader';
import { PageWrapper } from '@/shared/ui/PageWrapper';
import { FilterButton, getActiveFilterCount, RecipeFilters } from '@/widgets/RecipeFilters';
import { RecipeList } from '@/widgets/RecipeList';

import { HomeHeading } from './HomeHeading/HomeHeading';

import styles from './HomePage.module.scss';

const HIDDEN = { opacity: 0, scale: 0.6 };
const VISIBLE = { opacity: 1, scale: 1 };

const HomePage = () => {
    const [filters, setFilters] = useState<GetRecipesProps>({});
    const [isFiltersOpen, setIsFiltersOpen] = useState(false);
    const { data: recipes = [], isLoading } = useRecipes(filters);
    const { data: categories = [] } = useCategories();
    const { data: tags = [] } = useTags();

    // Когда поиск с фильтрами уходит под шапку, кнопка фильтров появляется в шапке
    const headerRef = useRef<HTMLElement>(null);
    const filtersRef = useRef<HTMLElement>(null);
    const isFiltersHidden = useIsHiddenBehind(filtersRef, headerRef);

    return (
        <PageWrapper
            header={
                <PageHeader ref={headerRef}>
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
            <RecipeList recipes={recipes} isLoading={isLoading} />
        </PageWrapper>
    );
};

export default HomePage;
