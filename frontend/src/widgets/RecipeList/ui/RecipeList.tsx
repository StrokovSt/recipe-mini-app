import { AnimatePresence } from 'motion/react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import type { Recipe } from '@recipe/common';

import { useLoader } from '@/shared/ui/GlobalLoader';

import RecipeItem from './RecipeItem/RecipeItem';

import styles from './RecipeList.module.scss'

interface RecipeListProps {
    recipes: Recipe[];
    isLoading: boolean;
}

const RecipeList = (props: RecipeListProps) => {
    const {recipes, isLoading} = props;
    const { t } = useTranslation('home');
    useLoader(isLoading);

    // Пока грузится, показывается глобальный котик
    return (
        <AnimatePresence mode="wait">
            {isLoading ? null : recipes.length === 0 ? (
                <div key="empty" className={styles.empty}>
                    {t('empty')}
                </div>
            ) : (
                <div key="list" className={styles.list}>
                    {recipes.map((recipe) => (
                        <RecipeItem key={recipe.id} recipe={recipe} />
                    ))}
                </div>
            )}
        </AnimatePresence>
    );
};

export default memo(RecipeList);
