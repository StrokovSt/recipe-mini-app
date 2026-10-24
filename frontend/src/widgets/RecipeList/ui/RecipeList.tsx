import { AnimatePresence, motion, type Transition, type Variants } from 'motion/react';
import { memo, type RefObject, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import type { Recipe } from '@recipe/common';

import { TRANSITION_BASE } from '@/shared/config/animation';
import { Message } from '@/shared/ui/Message';

import RecipeItem from './RecipeItem/RecipeItem';

import styles from './RecipeList.module.scss'

const HIDDEN = { opacity: 0 };
const VISIBLE = { opacity: 1 };
// Пока грузится новый список, прежний приглушён
const DIMMED = { opacity: 0.6 };
// Лесенка появления: шаг между карточками и сколько карточек ждут своей очереди, остальные идут вместе с последней
const CARD_STAGGER = 0.04;
const CARD_STAGGER_MAX = 8;
// Карточки, попавшие на экран в первые мгновения после показа списка, идут лесенкой,
// остальные мягко всплывают, когда до них докрутили (один раз)
const FIRST_SCREEN_TIME = 300;
// Всплывают, когда показались на 15%; появившиеся вместе (ряд сетки) идут друг за другом
const CARD_VIEWPORT = { once: true, amount: 0.15 };
const REVEAL_TRANSITION: Transition = { ...TRANSITION_BASE, duration: 0.6 };
const REVEAL_STAGGER = 0.08;
const REVEAL_BATCH_TIME = 50;

interface ListState {
    shownAt: number;
    // Самый первый список появляется вместе со страницей, его первый экран без своей анимации
    isFirst: boolean;
    // Последняя карточка, всплывшая при прокрутке, и её место в очереди
    revealedAt: number;
    revealIndex: number;
}

interface CardCustom {
    index: number;
    list: RefObject<ListState>;
}

const getRevealDelay = (list: ListState, now: number) => {
    list.revealIndex = now - list.revealedAt < REVEAL_BATCH_TIME ? list.revealIndex + 1 : 0;
    list.revealedAt = now;
    return list.revealIndex * REVEAL_STAGGER;
};

const getCardTransition = ({ index, list }: CardCustom): Transition => {
    const now = performance.now();

    if (now - list.current.shownAt > FIRST_SCREEN_TIME) {
        return { ...REVEAL_TRANSITION, delay: getRevealDelay(list.current, now) };
    }
    if (list.current.isFirst) return { duration: 0 };
    return { ...TRANSITION_BASE, delay: Math.min(index, CARD_STAGGER_MAX) * CARD_STAGGER };
};

const CARD_VARIANTS: Variants = {
    hidden: { opacity: 0, y: 24 },
    visible: (custom: CardCustom) => ({ opacity: 1, y: 0, transition: getCardTransition(custom) }),
};
// Обложки первых карточек видны сразу, их грузим без ленивой загрузки. Первая из них — главная картинка
// экрана для Lighthouse (LCP), её браузер качает раньше остальных
const EAGER_COVERS = 4;

interface RecipeListProps {
    recipes: Recipe[];
    isDimmed?: boolean;
}

const RecipeList = (props: RecipeListProps) => {
    const { recipes, isDimmed = false } = props;
    const { t } = useTranslation('home');
    const listState = useRef<ListState>({ shownAt: 0, isFirst: true, revealedAt: 0, revealIndex: 0 });
    // Срабатывает, когда список появился на странице: первый раз и потом на месте прежнего
    const markListShown = useCallback((list: HTMLDivElement | null) => {
        if (!list) return;
        listState.current = {
            shownAt: performance.now(),
            isFirst: listState.current.shownAt === 0,
            revealedAt: 0,
            revealIndex: 0,
        };
    }, []);

    // Новый набор рецептов — новый список: прежний гаснет целиком, новый проявляется лесенкой
    const listKey = recipes.map(({ id }) => id).join();

    return (
        <>
            {/* Заголовок не виден, его читает экранный диктор: дальше идёт список рецептов */}
            <h2 className={styles.heading}>{t('title')}</h2>
            <AnimatePresence mode="wait" initial={false}>
                {recipes.length === 0 ? (
                    <motion.div
                        key="empty"
                        className={styles.empty}
                        initial={HIDDEN}
                        animate={VISIBLE}
                        exit={HIDDEN}
                        transition={TRANSITION_BASE}
                    >
                        <Message illustration="idea" title={t('empty')} />
                    </motion.div>
                ) : (
                    <motion.div
                        key={listKey}
                        ref={markListShown}
                        className={styles.list}
                        animate={isDimmed ? DIMMED : VISIBLE}
                        exit={HIDDEN}
                        transition={TRANSITION_BASE}
                    >
                        {/* Своя AnimatePresence: внешняя с initial={false} иначе отключила бы карточкам
                            стартовое скрытие, и им нечем было бы всплывать при прокрутке */}
                        <AnimatePresence>
                            {recipes.map((recipe, index) => (
                                // Обёртка нужна motion: у самой карточки свой CSS transition на transform
                                <motion.div
                                    key={recipe.id}
                                    className={styles.item}
                                    variants={CARD_VARIANTS}
                                    custom={{ index, list: listState }}
                                    initial="hidden"
                                    whileInView="visible"
                                    viewport={CARD_VIEWPORT}
                                >
                                    <RecipeItem recipe={recipe} isEager={index < EAGER_COVERS} isPriority={index === 0} />
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default memo(RecipeList);
