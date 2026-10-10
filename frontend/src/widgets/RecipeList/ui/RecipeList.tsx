import { AnimatePresence } from 'motion/react';
import { memo } from 'react';

import type { Recipe } from '@recipe/common';

import { Spinner } from '@/shared/ui/Spinner';

import RecipeItem from './RecipeItem/RecipeItem';

import styles from './RecipeList.module.scss'

interface RecipeListProps {
    recipes: Recipe[];
    isLoading: boolean;
}

const RecipeList = (props: RecipeListProps) => {
    const {recipes, isLoading} = props;

    // mode="wait": список появляется, когда котик успел плавно исчезнуть
    return (
        <AnimatePresence mode="wait">
            {isLoading ? (
                <Spinner key="loader" size='xl' />
            ) : recipes.length === 0 ? (
                <div key="empty" className={styles.empty}>
                    Рецептов пока нет
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
