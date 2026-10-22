import { AnimatePresence, motion } from 'motion/react';
import { memo } from 'react';
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
const CARD_HIDDEN = { opacity: 0, y: 8 };
const CARD_VISIBLE = { opacity: 1, y: 0 };
// Лесенка появления: шаг между карточками и сколько карточек ждут своей очереди, остальные идут вместе с последней
const CARD_STAGGER = 0.04;
const CARD_STAGGER_MAX = 8;
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
                        className={styles.list}
                        animate={isDimmed ? DIMMED : VISIBLE}
                        exit={HIDDEN}
                        transition={TRANSITION_BASE}
                    >
                        {recipes.map((recipe, index) => (
                            // Обёртка нужна motion: у самой карточки свой CSS transition на transform
                            <motion.div
                                key={recipe.id}
                                className={styles.item}
                                initial={CARD_HIDDEN}
                                animate={CARD_VISIBLE}
                                transition={{ ...TRANSITION_BASE, delay: Math.min(index, CARD_STAGGER_MAX) * CARD_STAGGER }}
                            >
                                <RecipeItem recipe={recipe} isEager={index < EAGER_COVERS} isPriority={index === 0} />
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default memo(RecipeList);
