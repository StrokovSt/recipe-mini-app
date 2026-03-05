import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { AppRoute } from "@/app/router";
import { useCreateRecipe, useParseRecipe } from "@/entities/recipe";

const AddRecipePage = () => {
    const navigate = useNavigate();
    const [url, setUrl] = useState("");

    const { mutate: parseRecipe, data: parsed, isPending: isParsing } = useParseRecipe();
    const { mutate: createRecipe, isPending: isSaving } = useCreateRecipe();

    const handleParse = () => {
        if (url.trim()) parseRecipe(url.trim());
    };

    const handleSave = () => {
        if (!parsed) return;

        createRecipe(
            {
                ...parsed,
                category: "Без категории",
            },
            {
                onSuccess: () => navigate(AppRoute.Home),
            }
        );
    };

    return (
        <div>
            <h1>Добавить рецепт</h1>

            <input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Вставь ссылку на Pinterest или Telegram"
                style={{ width: "100%", marginBottom: 8 }}
            />
            <button onClick={handleParse} disabled={isParsing}>
                {isParsing ? "Парсим..." : "Извлечь рецепт"}
            </button>

            {parsed && (
                <div>
                    <h2>{parsed.title}</h2>
                    <p>Ингредиенты: {parsed.ingredients.join(", ")}</p>
                    <p>Шаги: {parsed.steps.length}</p>
                    <p>Теги: {parsed.tags.join(", ")}</p>

                    <button onClick={handleSave} disabled={isSaving}>
                        {isSaving ? "Сохраняем..." : "Сохранить рецепт"}
                    </button>
                </div>
            )}
        </div>
    );
}

export default AddRecipePage;