import clsx from 'clsx';
import { AnimatePresence, m, type MotionStyle, type Variants } from 'motion/react';
import { memo, type ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { Recipe } from '@recipe/common';

import { TRANSITION_BASE } from '@/shared/config/animation';
import { Message } from '@/shared/ui/Message';

import { getBentoPlacements } from '../lib/getBentoPlacements';
import RecipeItem from './RecipeItem/RecipeItem';

import styles from './RecipeList.module.scss'

const HIDDEN = { opacity: 0 };
const VISIBLE = { opacity: 1 };
// Пока грузится новый список, прежний приглушён
const DIMMED = { opacity: 0.6 };
// Лесенка появления нового списка: шаг между карточками и сколько карточек ждут своей очереди, остальные идут вместе с последней
const CARD_STAGGER = 0.04;
const CARD_STAGGER_MAX = 8;

// transform строкой, а не y: так motion отдаёт анимацию браузеру (WAAPI) и она не грузит основной поток
const CARD_VARIANTS: Variants = {
    hidden: { opacity: 0, transform: "translateY(8px)" },
    visible: (index: number) => ({
        opacity: 1,
        transform: "translateY(0px)",
        transitionEnd: { transform: "none" },
        transition: { ...TRANSITION_BASE, delay: Math.min(index, CARD_STAGGER_MAX) * CARD_STAGGER },
    }),
};
// Обложки первых карточек видны сразу, их грузим без ленивой загрузки. Первая из них — главная картинка
// экрана для Lighthouse (LCP), её браузер качает раньше остальных
const EAGER_COVERS = 4;
// Размер из CSS-переменной в px
const readSize = (element: HTMLElement, name: string) => parseFloat(getComputedStyle(element).getPropertyValue(name));

// Сколько колонок живой сетки влезает в её ширину: колонка не уже --size-bento-column, но не меньше
// --size-bento-min-columns колонок
const countBentoColumns = (list: HTMLElement) => {
    const gap = readSize(list, '--list-gap');
    const fit = Math.floor((list.clientWidth + gap) / (readSize(list, '--size-bento-column') + gap));

    return Math.max(readSize(list, '--size-bento-min-columns'), fit);
};

interface RecipeListProps {
    recipes: Recipe[];
    isDimmed?: boolean;
    // Список отобран поиском или фильтрами: пустой значит «ничего не нашлось», а не «рецептов нет»
    isFiltered?: boolean;
    // Кнопки под сообщением о пустой коллекции (не для «ничего не нашлось»)
    emptyAction?: ReactNode;
    // Компьютер: живая сетка с широкими и высокими карточками
    isBento?: boolean;
}

const RecipeList = (props: RecipeListProps) => {
    const { recipes, isDimmed = false, isFiltered = false, emptyAction, isBento = false } = props;
    const { t } = useTranslation('home');
    const emptyKey = isFiltered ? 'emptyFiltered' : 'empty';
    // Новый набор рецептов — новый список: прежний гаснет целиком, новый проявляется лесенкой
    const listKey = recipes.map(({ id }) => id).join();
    // Живая сетка: узор строится под число колонок, оно зависит от ширины списка
    const [bentoColumns, setBentoColumns] = useState(0);
    const placements = isBento && bentoColumns > 0 ? getBentoPlacements(recipes.length, bentoColumns) : [];

    // Колонки считаем, как только список появился (до отрисовки на экране), и при каждой смене его ширины
    const observeBento = (list: HTMLDivElement | null) => {
        if (!list || !isBento) return;

        setBentoColumns(countBentoColumns(list));
        const observer = new ResizeObserver(() => setBentoColumns(countBentoColumns(list)));
        observer.observe(list);

        return () => observer.disconnect();
    };

    return (
        <>
            {/* Заголовок не виден, его читает экранный диктор: дальше идёт список рецептов */}
            <h2 className={styles.heading}>{t('title')}</h2>
            <AnimatePresence mode="wait" initial={false}>
                {recipes.length === 0 ? (
                    <m.div
                        key={emptyKey}
                        className={styles.empty}
                        initial={HIDDEN}
                        animate={VISIBLE}
                        exit={HIDDEN}
                        transition={TRANSITION_BASE}
                    >
                        <Message
                            illustration="empty"
                            title={t(`${emptyKey}.title`)}
                            text={t(`${emptyKey}.text`)}
                            action={!isFiltered && emptyAction}
                        />
                    </m.div>
                ) : (
                    <m.div
                        key={listKey}
                        ref={observeBento}
                        className={clsx(styles.list, isBento && styles.bento)}
                        style={isBento ? { '--bento-columns': bentoColumns || undefined } as MotionStyle : undefined}
                        animate={isDimmed ? DIMMED : VISIBLE}
                        exit={HIDDEN}
                        transition={TRANSITION_BASE}
                    >
                        {/* Первый список появляется вместе со страницей: его карточки без своей анимации (initial={false} выше) */}
                        {recipes.map((recipe, index) => {
                            const placement = placements[index];
                            const layout = placement?.layout ?? 'regular';

                            return (
                                // Обёртка нужна motion: у самой карточки свой CSS transition на transform
                                <m.div
                                    key={recipe.id}
                                    className={clsx(styles.item, styles[layout])}
                                    style={placement && { gridColumn: placement.column, gridRow: placement.row }}
                                    variants={CARD_VARIANTS}
                                    custom={index}
                                    initial="hidden"
                                    animate="visible"
                                >
                                    <RecipeItem
                                        recipe={recipe}
                                        isEager={index < EAGER_COVERS}
                                        isPriority={index === 0}
                                        layout={layout}
                                    />
                                </m.div>
                            );
                        })}
                    </m.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default memo(RecipeList);
