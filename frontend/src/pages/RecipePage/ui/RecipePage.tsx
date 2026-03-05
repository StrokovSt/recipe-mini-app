import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { AppRoute } from '@/app/router';
import { useDeleteRecipe, useRecipe } from '@/entities/recipe';

const RecipePage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const { data: recipe, isLoading, isError } = useRecipe(id!);
    const { mutate: deleteRecipe } = useDeleteRecipe();

    if (isLoading) return <div>Загрузка...</div>;
    if (isError || !recipe) return <div>Рецепт не найден</div>;

    const handleDelete = () => {
        deleteRecipe(recipe.id, {
        onSuccess: () => navigate(AppRoute.Home),
        });
    };

    const video = recipe.media.find((m) => m.type === "video");
    const images = recipe.media.filter((m) => m.type === "image");

    console.log('recipe: ', recipe)

    return (
        <div style={{ padding: 20, maxWidth: 600 }}>
        <button onClick={() => navigate(AppRoute.Home)}>← Назад</button>

        <h1 style={{ margin: "16px 0 8px" }}>{recipe.title}</h1>

        <p>Категория: {recipe.category}</p>
        <p>Теги: {recipe.tags.map((t) => t.tag.name).join(", ")}</p>

        <div style={{ display: "flex", gap: 8, margin: "8px 0" }}>
            {recipe.time && <span>⏱ {recipe.time}</span>}
            {recipe.servings && <span>🍽 {recipe.servings} порций</span>}
        </div>

        {video && (
            <video
            src={video.url}
            controls
            style={{ width: "100%", borderRadius: 8, marginBottom: 12 }}
            />
        )}

        {!video && images[0] && (
            <img
            src={images[0].url}
            alt={recipe.title}
            style={{ width: "100%", height: 300, objectFit: "cover", borderRadius: 8, marginBottom: 12 }}
            />
        )}

        <h3>Ингредиенты</h3>
        <ul>
            {recipe?.ingredients?.map((ing, i) => (
                <li key={i}>{ing}</li>
            ))}
        </ul>

        <h3>Приготовление</h3>
        <ol>
            {recipe.steps.map((step, i) => (
            <li key={i} style={{ marginBottom: 8 }}>{step}</li>
            ))}
        </ol>

        {recipe.telegraphUrl && (
            <a href={recipe.telegraphUrl} target="_blank" rel="noreferrer">
            Открыть в Telegraph
            </a>
        )}

        <div style={{ marginTop: 20, display: "flex", gap: 8 }}>
            <a href={recipe.sourceUrl} target="_blank" rel="noreferrer">
            Открыть оригинал
            </a>
            <button onClick={handleDelete} style={{ color: "red", marginLeft: "auto" }}>
            Удалить рецепт
            </button>
        </div>
        </div>
    );
};

export default RecipePage;