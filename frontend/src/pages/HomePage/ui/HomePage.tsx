import { AnimatePresence, m } from 'motion/react';
import { type Dispatch, type SetStateAction, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';

import { useCategories } from "@/entities/category";
import { useRecipes } from '@/entities/recipe';
import type { GetRecipesProps } from '@/entities/recipe/types';
import { useTags } from '@/entities/tag';
import { Onboarding } from '@/features/onboarding';
import CloseIcon from '@/shared/assets/icons/icon-close.svg?react';
import { TRANSITION_BASE } from '@/shared/config/animation';
import { useIsHiddenBehind } from '@/shared/lib/hooks';
import { useLayoutMode } from '@/shared/lib/layout';
import { useLoader } from '@/shared/ui/GlobalLoader';
import { LoadErrorMessage } from '@/shared/ui/Message';
import { PageHeader, usePageHeaderBar } from '@/shared/ui/PageHeader';
import { PageWrapper } from '@/shared/ui/PageWrapper';
import { FilterButton, getActiveFilterCount, RecipeFilters } from '@/widgets/RecipeFilters';
import { RecipeList } from '@/widgets/RecipeList';

import { CategoryStrip } from './CategoryStrip/CategoryStrip';
import { EmptyActions } from './EmptyActions/EmptyActions';
import { HomeHeading } from './HomeHeading/HomeHeading';
import { TagStrip } from './TagStrip/TagStrip';

import styles from './HomePage.module.scss';

const HIDDEN = { opacity: 0, scale: 0.6 };
const VISIBLE = { opacity: 1, scale: 1 };
// Один элемент на все отрисовки: список обёрнут в memo и не перерисовывается из-за новых кнопок
const EMPTY_ACTIONS = <EmptyActions />;

const HomePage = () => {
    // Поиск, категория и теги живут в адресе: на главную ведут плитки разделов, а после возврата назад всё на месте
    const [searchParams, setSearchParams] = useSearchParams();

    const filters = useMemo<GetRecipesProps>(() => {
        const tagIds = searchParams.getAll('tag');

        return {
            search: searchParams.get('search') ?? undefined,
            categoryId: searchParams.get('category') ?? undefined,
            tagIds: tagIds.length > 0 ? tagIds : undefined,
        };
    }, [searchParams]);

    const setFilters: Dispatch<SetStateAction<GetRecipesProps>> = (action) => {
        const next = typeof action === 'function' ? action(filters) : action;
        const params = new URLSearchParams();

        if (next.search) params.set('search', next.search);
        if (next.categoryId) params.set('category', next.categoryId);
        next.tagIds?.forEach((id) => params.append('tag', id));

        if (params.toString() !== searchParams.toString()) setSearchParams(params, { replace: true });
    };
    const [isFiltersOpen, setIsFiltersOpen] = useState(false);
    const { t } = useTranslation('home');
    // Компьютер: поиск в шапке, под ней ряд категорий, заголовок раздела и живая сетка
    const mode = useLayoutMode();
    const isDesktop = mode === 'desktop' || mode === 'wide';
    const [searchSlot, setSearchSlot] = useState<HTMLDivElement | null>(null);
    const { data: recipes, isLoading, isPlaceholderData, isError, isPaused, isFetching, refetch } = useRecipes(filters);
    const { data: categories = [] } = useCategories();
    const { data: tags = [] } = useTags();

    // Когда поиск с фильтрами уходит под шапку, кнопка фильтров появляется в шапке
    const headerBar = usePageHeaderBar();
    const filtersRef = useRef<HTMLElement>(null);
    const isFiltersHidden = useIsHiddenBehind(filtersRef, headerBar);

    // Список не пришёл (сервер не ответил или нет сети): вместо «Рецептов пока нет» — ошибка и «Повторить»
    const isFailed = !recipes && (isError || isPaused);

    // Первая загрузка списка: страница ждёт за глобальным котиком. Смена фильтров котика не зовёт (keepPreviousData).
    // «Повторить» после ошибки тоже показывает котика
    useLoader(isLoading || (isFailed && isFetching));
    if (isLoading) return null;

    const activeCategory = categories.find(({ id }) => id === filters.categoryId);
    const hasFilters = Boolean(filters.search) || getActiveFilterCount(filters) > 0;

    return (
        <PageWrapper
            header={
                isDesktop ? (
                    <PageHeader search={<div ref={setSearchSlot} className={styles.searchSlot} />} />
                ) : (
                    <PageHeader>
                        <HomeHeading
                            actions={
                                <AnimatePresence initial={false}>
                                    {isFiltersHidden && (
                                        <m.div
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
                                        </m.div>
                                    )}
                                </AnimatePresence>
                            }
                        />
                    </PageHeader>
                )
            }
        >
            {isDesktop && (
                <div className={styles.titleRow}>
                    <h1 className={styles.title}>
                        {t('yourCollection')}
                        {activeCategory && <span className={styles.titleCategory}> — {activeCategory.name}</span>}
                    </h1>
                    {/* Сброс виден, только пока что-то выбрано: категория, теги или поиск */}
                    {hasFilters && (
                        <button type="button" className={styles.reset} onClick={() => setFilters({})}>
                            <CloseIcon aria-hidden />
                            {t('resetFilters')}
                        </button>
                    )}
                    {recipes && <span className={styles.total}>{t('total', { count: recipes.length })}</span>}
                </div>
            )}
            {/* Категории и теги одной группой: между ними отступ меньше, чем между блоками страницы */}
            {isDesktop && (
                <div className={styles.browse}>
                    <CategoryStrip categories={categories} filters={filters} setFilters={setFilters} />
                    <TagStrip tags={tags} filters={filters} setFilters={setFilters} />
                </div>
            )}
            <RecipeFilters
                ref={filtersRef}
                categories={categories}
                tags={tags}
                setFilters={setFilters}
                filters={filters}
                isOpen={isFiltersOpen}
                onOpenChange={setIsFiltersOpen}
                barContainer={isDesktop ? searchSlot : undefined}
            />
            {isFailed ? (
                <LoadErrorMessage onRetry={() => refetch()} />
            ) : (
                <RecipeList
                    recipes={recipes ?? []}
                    isDimmed={isPlaceholderData}
                    isFiltered={hasFilters}
                    emptyAction={EMPTY_ACTIONS}
                    isBento={isDesktop}
                />
            )}
            <Onboarding />
        </PageWrapper>
    );
};

export default HomePage;
