import clsx from 'clsx';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import type { Recipe } from '@recipe/common';

import { getCategoryIcon, getCategoryIconName } from '@/entities/category';
import { getImageSrcSet, getImageUrl } from '@/shared/lib/image';

import type { BentoLayout } from '../../lib/getBentoPlacements';

import styles from './RecipeItem.module.scss';

// Копии обложки с шагом 50px, от 200 до 750: браузер берёт ближайшую к ширине карточки
// с учётом плотности пикселей. Самая широкая карточка ~246px, на экране 3x это 738px
const COVER_WIDTHS = Array.from({ length: 12 }, (_, index) => 200 + index * 50);
// Точная ширина карточки на экране. В sizes нельзя подставить CSS-переменные, поэтому числа
// повторяют сетку RecipeList: отступы страницы --space-page (20px, до 360px — 12px), промежуток
// --space-3 (12px), карточка не уже --size-card-min-width (160px), до 4 колонок, приложение не шире 1024px.
// Уже 360px карточка одна в ряду, фото слева на 40% её ширины
const COVER_SIZES = [
    '(max-width: 359px) calc((100vw - 24px) * 0.4)',
    '(min-width: 1024px) 237px',
    '(min-width: 716px) calc((100vw - 76px) / 4)',
    '(min-width: 544px) calc((100vw - 64px) / 3)',
    '(min-width: 361px) calc((100vw - 52px) / 2)',
    'calc((100vw - 36px) / 2)',
].join(', ');
// Живая сетка компьютера: колонка до ~390px, фото широкой карточки ~440px, высокой — на две строки (680px)
// и обрезается по бокам, поэтому шире
const BENTO_COVER_SIZES: Record<BentoLayout, string> = { small: '390px', wide: '440px', tall: '520px' };

// Вид карточки в живой сетке компьютера: обычная, широкая (фото слева, текст справа), высокая (на две строки)
export type RecipeItemLayout = 'regular' | BentoLayout;

interface RecipeItemProps {
    recipe: Recipe;
    isEager?: boolean;
    isPriority?: boolean;
    layout?: RecipeItemLayout;
    // Форма мазка под фото (shared/styles/brush.scss), у высокой карточки своя
    brush?: number;
}

const RecipeItem = (props: RecipeItemProps) => {
    const { recipe, isEager = false, isPriority = false, layout = 'regular', brush = 1 } = props;
    const { t } = useTranslation('common');
    const { id, title, description, steps, prepTime, cookTime, servings, source, media, category } = recipe;

    const cover = media.find((item) => item.type === 'image');
    const PlaceholderIcon = getCategoryIcon(category.iconName);
    const summary = description ?? steps[0]?.text;
    const time = (prepTime ?? 0) + (cookTime ?? 0);
    // Мазок под фото и росчерк под временем в цветах плитки категории: класс с ключом картинки (category-colors.scss)
    const theme = getCategoryIconName(category.iconName).toLowerCase();

    return (
        <Link to={`/recipe/${id}`} state={{ fromList: true }} className={clsx(styles.card, styles[layout], styles[theme])}
            data-brush={layout === 'tall' ? 'tall' : brush}
        >
            <div className={styles.media}>
                {cover ? (
                    <img
                        src={getImageUrl(cover.url, COVER_WIDTHS[COVER_WIDTHS.length - 1])}
                        srcSet={getImageSrcSet(cover.url, COVER_WIDTHS)}
                        sizes={layout === 'regular' ? COVER_SIZES : BENTO_COVER_SIZES[layout]}
                        alt={title}
                        loading={isEager ? 'eager' : 'lazy'}
                        fetchPriority={isPriority ? 'high' : undefined}
                        className={styles.image}
                    />
                ) : (
                    <PlaceholderIcon className={styles.placeholder} aria-hidden />
                )}
                {source === 'telegram' && (
                    <span className={styles.badge}>TG</span>
                )}
            </div>

            <div className={styles.body}>
                <h3 className={styles.title}>{title}</h3>

                {(time > 0 || !!servings) && (
                    <div className={styles.meta}>
                        {time > 0 && <span>{t('minutes', { count: time })}</span>}
                        {!!servings && <span>{t('servingsShort', { count: servings })}</span>}
                    </div>
                )}

                {summary && (
                    <p className={styles.description}>{summary}</p>
                )}
            </div>
        </Link>
    );
};

export default memo(RecipeItem);
