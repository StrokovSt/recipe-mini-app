import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { AppRoute } from "@/app/router";
import { ParsedRecipe, useCreateRecipe, useParseRecipe } from "@/entities/recipe";
import { ApiError } from "@/shared/api";

const AddRecipePage = () => {
    const navigate = useNavigate();
    const [url, setUrl] = useState("");
    const [parsed, setParsed] = useState<ParsedRecipe | null>(null);
    const [category, setCategory] = useState("Без категории");

    const { mutate: parseRecipe, isPending: isParsing, error: parseError } = useParseRecipe();
    const { mutate: createRecipe, isPending: isSaving } = useCreateRecipe();

    const errorMessage = parseError instanceof ApiError
        ? parseError.message
        : parseError?.message ?? null;

    const handleParse = () => {
        if (!url.trim()) return;
        parseRecipe(url.trim(), {
        onSuccess: (data) => setParsed(data),
        });
    };

    const handleSave = () => {
        if (!parsed) return;
        createRecipe(
            { ...parsed, category },
            { onSuccess: () => navigate(AppRoute.Home) }
        );
    };

    return (
        <div style={{ padding: 20, maxWidth: 600 }}>
        <h1>Добавить рецепт</h1>

        <div style={{ marginBottom: 16 }}>
            <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Ссылка на Pinterest или Telegram"
            style={{ width: "100%", padding: 8, marginBottom: 8 }}
            />
            <button onClick={handleParse} disabled={isParsing || !url.trim()}>
            {isParsing ? "Загружаем..." : "Извлечь рецепт"}
            </button>
        </div>

        {parseError && (
            <p style={{ color: "red" }}>Ошибка: {errorMessage}</p>
        )}

        {parsed && (
            <div style={{ marginTop: 20 }}>
            <h2>{parsed.title}</h2>

            {parsed.media[0] && (
                <img
                src={parsed.media[0].url}
                alt={parsed.title}
                style={{ width: "100%", maxHeight: 300, objectFit: "cover", borderRadius: 8 }}
                />
            )}

            <div style={{ margin: "12px 0" }}>
                <label>Категория: </label>
                <input
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{ padding: 6 }}
                />
            </div>

            <h3>Ингредиенты</h3>
            <ul>
                {parsed.ingredients.map((ing, i) => <li key={i}>{ing}</li>)}
            </ul>

            <h3>Шаги</h3>
            <ol>
                {parsed.steps.map((step, i) => <li key={i}>{step}</li>)}
            </ol>

            <h3>Теги</h3>
            <p>{parsed.tags.join(", ")}</p>

            <button onClick={handleSave} disabled={isSaving} style={{ marginTop: 16 }}>
                {isSaving ? "Сохраняем..." : "Сохранить рецепт"}
            </button>
            </div>
        )}
        </div>
    );
}

export default AddRecipePage;