import { type Dispatch, memo, type Ref, type SetStateAction, useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { Category, Tag } from '@recipe/common';

import { getCategoryIcon } from '@/entities/category';
import type { GetRecipesProps } from '@/entities/recipe/types';
import { BottomSheet } from '@/shared/ui/BottomSheet';
import { OutlineButton, RegularButton } from '@/shared/ui/Buttons';
import { CategoryComponent } from '@/shared/ui/CategoryComponent';
import { ExpandableList } from '@/shared/ui/ExpandableList';
import { SearchInput } from '@/shared/ui/Input';
import { TagComponent } from '@/shared/ui/Tag';

import { getActiveFilterCount } from '../lib/getActiveFilterCount';
import { isSameFilters } from '../lib/isSameFilters';
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

    // Поиск на странице применяется сразу
    const handleSearchChange = (search: string) => {
        setFilters((prev) => ({
            ...prev,
            search: search || undefined,
        }));
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

    return (
        <article ref={ref}>
            <div className={styles.bar}>
                <SearchInput
                    className={styles.search}
                    value={filters.search ?? ""}
                    onChange={handleSearchChange}
                    placeholder={t('searchPlaceholder')}
                    disabled={disabled}
                />

                <FilterButton
                    className={styles.filter}
                    activeCount={activeCount}
                    onClick={() => onOpenChange(true)}
                    disabled={disabled}
                />
            </div>

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
