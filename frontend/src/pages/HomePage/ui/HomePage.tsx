import React from 'react';

import { useRecipes } from '@/entities/recipe';

const HomePage = () => {
    const { data, isLoading, isError } = useRecipes();

    if (isLoading) return <div>Загрузка...</div>;
    if (isError) return <div>Ошибка загрузки</div>;

    return (
        <div>
            <h1>Мои рецепты</h1>
            {data?.length === 0 && <p>Рецептов пока нет</p>}

            {data?.map((recipe) => (
                <div key={recipe.id}>
                    <p>{recipe.title}</p>
                </div>
            ))}
        </div>
    );
};

export default HomePage;