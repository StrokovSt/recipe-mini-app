import clsx from 'clsx';
import { type Dispatch, type FocusEvent, type KeyboardEvent, memo, type Ref, type SetStateAction, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';

import type { Category, Tag } from '@recipe/common';

import { getCategoryIcon } from '@/entities/category';
import type { GetRecipesProps } from '@/entities/recipe/types';
import { addToSearchHistory, SearchHistory } from '@/features/search-history';
import { BottomSheet } from '@/shared/ui/BottomSheet';
import { OutlineButton, RegularButton } from '@/shared/ui/Buttons';
import { CategoryComponent } from '@/shared/ui/CategoryComponent';
import { ExpandableList } from '@/shared/ui/ExpandableList';
import { SearchInput } from '@/shared/ui/Input';
import { TagComponent } from '@/shared/ui/Tag';

import { getActiveFilterCount } from '../lib/getActiveFilterCount';
import { isSameFilters } from '../lib/isSameFilters';
import ActiveFilters from './ActiveFilters/ActiveFilters';
import { FilterButton } from './FilterButton/FilterButton';

import styles from './RecipeFilters.module.scss';

// Сколько рядов категорий и тегов видно в свёрнутом фильтре
const COLLAPSED_ROWS = 2;
// Задержка поиска на главной, мс. Подольше, чтобы запрос ушёл и попал в историю, когда человек допечатал
const SEARCH_DELAY = 800;

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
    // Компьютер: поиск с кнопкой фильтров встают сюда (в шапку), а категории и теги выбираются на странице
    barContainer?: HTMLElement | null;
    ref?: Ref<HTMLElement>;
}

const RecipeFilters = (props: RecipeFiltersProps) => {
    const {categories, tags, filters, setFilters, isOpen, onOpenChange, disabled, barContainer, ref} = props;
    const { t } = useTranslation('filters');

    const activeCount = getActiveFilterCount(filters);

    // В шторке правится черновик, в фильтры он попадает только по кнопке «Применить»
    const [draft, setDraft] = useState<GetRecipesProps>(filters);
    const [prevIsOpen, setPrevIsOpen] = useState(isOpen);

    // Каждое открытие начинается с применённых фильтров, незакрытые правки прошлого раза теряются
    if (isOpen !== prevIsOpen) {
        setPrevIsOpen(isOpen);
        if (isOpen) setDraft(filters);
    }

    // Список недавних запросов открыт, пока поле поиска в фокусе. Набранный текст (по нему фильтруется список)
    // берём из поля сразу, не дожидаясь задержки поиска, а при смене поиска снаружи (шторка, история) подхватываем при отрисовке
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [query, setQuery] = useState(filters.search ?? '');
    const [prevSearch, setPrevSearch] = useState(filters.search);

    if (filters.search !== prevSearch) {
        setPrevSearch(filters.search);
        setQuery(filters.search ?? '');
    }

    // Поиск на странице применяется после задержки и сразу запоминается в истории
    const handleSearchChange = (search: string) => {
        setQuery(search);
        addToSearchHistory(search);
        setFilters((prev) => ({
            ...prev,
            search: search || undefined,
        }));
    };

    // Список следит только за самим полем ввода: нажатие на крестик очистки уводит фокус с поля и закрывает список
    const handleSearchFocus = (event: FocusEvent<HTMLLabelElement>) => {
        if (event.target instanceof HTMLInputElement) setIsSearchFocused(true);
    };

    const handleSearchBlur = (event: FocusEvent<HTMLLabelElement>) => {
        if (event.target instanceof HTMLInputElement) setIsSearchFocused(false);
    };

    // Enter прячет клавиатуру, вместе с ней закрывается список
    const handleSearchKeyDown = (event: KeyboardEvent<HTMLLabelElement>) => {
        if (event.key === 'Enter' && event.target instanceof HTMLInputElement) event.target.blur();
    };

    const handleHistoryPick = (search: string) => {
        handleSearchChange(search);
        if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
    };

    const handleDraftSearchChange = (search: string) => {
        setDraft((prev) => ({
            ...prev,
            search: search || undefined,
        }));
    };

    const handleCategoryChange = (categoryId: string | undefined) => {
        setDraft((prev) => ({
            ...prev,
            categoryId,
        }));
    };

    const handleTagToggle = (tagId: string) => {
        setDraft((prev) => {
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
        setDraft((prev) => ({ search: prev.search }));
    };

    const handleApply = () => {
        setFilters(draft);
        onOpenChange(false);
    };

    const bar = (
        <div className={styles.bar}>
            <SearchInput
                className={styles.search}
                value={filters.search ?? ""}
                onChange={handleSearchChange}
                placeholder={t('searchPlaceholder')}
                disabled={disabled}
                data-onboarding="search"
                delay={SEARCH_DELAY}
                onFocus={handleSearchFocus}
                onBlur={handleSearchBlur}
                onInput={(event) => setQuery((event.target as HTMLInputElement).value)}
                onKeyDown={handleSearchKeyDown}
            />

            <FilterButton
                className={styles.filter}
                activeCount={activeCount}
                onClick={() => onOpenChange(true)}
                disabled={disabled}
                data-onboarding="filter"
            />

            <SearchHistory isOpen={isSearchFocused} query={query} onPick={handleHistoryPick} />
        </div>
    );

    return (
        // На компьютере здесь остаётся только окно фильтров: блок не занимает места на странице
        <article ref={ref} className={clsx(barContainer && styles.portalled)}>
            {barContainer ? (
                createPortal(bar, barContainer)
            ) : (
                <ActiveFilters categories={categories} tags={tags} filters={filters} setFilters={setFilters} />
            )}

            <BottomSheet
                isOpen={isOpen}
                onClose={() => onOpenChange(false)}
                title={t('title')}
                subtitle={t('subtitle')}
                footer={
                    <>
                        <OutlineButton
                            label={t('reset')}
                            onClick={handleReset}
                            disabled={getActiveFilterCount(draft) === 0}
                        />
                        <RegularButton
                            label={t('apply')}
                            className={styles.apply}
                            onClick={handleApply}
                            // Активна, только когда в шторке что-то поменяли
                            disabled={isSameFilters(draft, filters)}
                        />
                    </>
                }
            >
                <section className={styles.section}>
                    <h3 className={styles.sectionTitle}>{t('search')}</h3>
                    <SearchInput
                        value={draft.search ?? ""}
                        onChange={handleDraftSearchChange}
                        placeholder={t('searchPlaceholder')}
                        // Черновику задержка не нужна: запрос уйдёт только по «Применить»
                        delay={0}
                    />
                </section>

                <section className={styles.section}>
                    <h3 className={styles.sectionTitle}>{t('categories')}</h3>
                    <ExpandableList
                        items={categories}
                        rows={COLLAPSED_ROWS}
                        isPinned={(category) => draft.categoryId === category.id}
                        className={styles.categories}
                        renderItem={(category) => {
                            const Icon = getCategoryIcon(category.iconName);

                            return (
                                <CategoryComponent
                                    key={category.id}
                                    label={category.name}
                                    icon={<Icon />}
                                    isActive={draft.categoryId === category.id}
                                    onClick={() =>
                                        handleCategoryChange(
                                            draft.categoryId === category.id
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
                    <h3 className={styles.sectionTitle}>{t('tags')}</h3>
                    <ExpandableList
                        items={tags}
                        rows={COLLAPSED_ROWS}
                        isPinned={(tag) => draft.tagIds?.includes(tag.id) ?? false}
                        className={styles.tags}
                        renderItem={(tag) => (
                            <TagComponent
                                key={tag.id}
                                tag={tag}
                                clickHandler={handleTagToggle}
                                tagIsActive={draft.tagIds?.includes(tag.id) ?? false}
                            />
                        )}
                    />
                </section>
            </BottomSheet>
        </article>
    );
};

export default memo(RecipeFilters);
