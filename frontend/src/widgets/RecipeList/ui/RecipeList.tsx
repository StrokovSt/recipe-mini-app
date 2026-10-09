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

    if (isLoading) return <Spinner size='xl' />;

    if (recipes.length === 0) {
        return (
            <div className={styles.empty}>
                Рецептов пока нет
            </div>
        );
    }
    
    return (
        <div className={styles.list}>
            {recipes.map((recipe) => (
                <RecipeItem key={recipe.id} recipe={recipe} />
            ))}
        </div>
    );
};

export default memo(RecipeList);
