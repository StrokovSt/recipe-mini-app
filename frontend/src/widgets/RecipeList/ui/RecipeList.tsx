import { AnimatePresence } from 'motion/react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import type { Recipe } from '@recipe/common';

import { Message } from '@/shared/ui/Message';

import RecipeItem from './RecipeItem/RecipeItem';

import styles from './RecipeList.module.scss'

interface RecipeListProps {
    recipes: Recipe[];
}

const RecipeList = (props: RecipeListProps) => {
    const { recipes } = props;
    const { t } = useTranslation('home');

    return (
        <AnimatePresence mode="wait">
            {recipes.length === 0 ? (
                <div key="empty">
                    <Message illustration="idea" title={t('empty')} />
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
