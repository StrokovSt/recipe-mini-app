import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { AppRoute } from '@/app/router';
import { useCategories, useDeleteRecipe, useRecipes } from '@/entities/recipe';

const HomePage = () => {
    const navigate = useNavigate();
    const [category, setCategory] = useState<string | undefined>();
    const [search, setSearch] = useState("");

    const { data: recipes, isLoading } = useRecipes({ category, search });
    const { data: categories } = useCategories();
    const { mutate: deleteRecipe } = useDeleteRecipe();

    if (isLoading) return <div>Загрузка...</div>;

    return (
        <div style={{ padding: 20, maxWidth: 600 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h1>Мои рецепты</h1>
            <button onClick={() => navigate(AppRoute.AddRecipe)}>+ Добавить</button>
        </div>

        <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск..."
            style={{ width: "100%", padding: 8, margin: "12px 0" }}
        />

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
            {categories?.map((cat) => (
            <button
                key={cat}
                onClick={() => setCategory(cat === "Все" ? undefined : cat)}
                style={{ fontWeight: category === cat ? "bold" : "normal" }}
            >
                {cat}
            </button>
            ))}
        </div>

        {recipes?.length === 0 && <p>Рецептов пока нет</p>}

        {recipes?.map((recipe) => (
            <div key={recipe.id} style={{ border: "1px solid #ccc", borderRadius: 8, padding: 12, marginBottom: 12 }}>
            {recipe.media[0] && (
                <img
                src={recipe.media[0].url}
                alt={recipe.title}
                style={{ width: "100%", height: 200, objectFit: "cover", borderRadius: 6 }}
                />
            )}
            <h3>{recipe.title}</h3>
            <p>Категория: {recipe.category}</p>
            <p>Теги: {recipe.tags.map((t) => t.tag.name).join(", ")}</p>
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                <button onClick={() => navigate(`/recipe/${recipe.id}`)}>Открыть</button>
                <button onClick={() => deleteRecipe(recipe.id)} style={{ color: "red" }}>Удалить</button>
            </div>
            </div>
        ))}
        </div>
    );
};

export default HomePage;