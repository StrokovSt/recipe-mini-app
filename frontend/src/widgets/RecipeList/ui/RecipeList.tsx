import React, { memo } from 'react';
import { useNavigate } from 'react-router-dom';

import { Recipe } from '@recipe/common';

import { Spinner } from '@/shared/ui/Spinner';

import styles from './RecipeList.module.scss'

interface RecipeListProps {
    recipes: Recipe[];
    isLoading: boolean;
}

const RecipeList = (props: RecipeListProps) => {
    const {recipes, isLoading} = props;
    const navigate = useNavigate();

    if (isLoading) return <Spinner size='xl' />;

    if (recipes.length === 0) {
        return (
            <div className={styles.empty}>
                Рецептов пока нет
            </div>
        );
    }
    
    return (
        <div>
            {recipes.map((recipe) => (
                <div key={recipe.id} className={styles.card} onClick={() => navigate(`/recipe/${recipe.id}`)}>
                    <div className={styles.cardMedia}>
                        {recipe.media[0] && (
                            <img src={recipe.media[0].url} alt={recipe.title} className={styles.cardImg} />
                        )}
                    </div>
                    <div className={styles.cardBody}>
                        <p className={styles.cardTitle}>{recipe.title}</p>
                        {recipe.time && 
                            <p className={styles.cardTime}>⏱ {recipe.time}</p>
                        }
                    </div>
                </div>
            ))}
        </div>
    );
};

export default memo(RecipeList);