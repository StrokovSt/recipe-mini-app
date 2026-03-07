import { useState } from "react";
import { useNavigate } from "react-router-dom";

import type { ParsedRecipe } from "@recipe/common";

import { AppRoute } from "@/app/router";
import { useCreateRecipe, useParseRecipe } from "@/entities/recipe";

import { RecipeEditForm } from "./RecipeEditForm/RecipeEditForm";
import { UrlForm } from "./UrlForm/UrlForm";

const AddRecipePage = () => {
const navigate = useNavigate();
    const [url, setUrl] = useState("");
    const [parsed, setParsed] = useState<ParsedRecipe | null>(null);
    const [category, setCategory] = useState("Без категории");

    const { mutate: parseRecipe, isPending: isParsing, error: parseError } = useParseRecipe();
    const { mutate: createRecipe, isPending: isSaving } = useCreateRecipe();

    const handleParse = () => {
        if (!url.trim()) return;
        parseRecipe(url.trim(), { onSuccess: (data) => setParsed(data) });
    };

    const handleSave = () => {
        if (!parsed) return;
        createRecipe({ ...parsed, category }, { onSuccess: () => navigate(AppRoute.Home) });
    };

    const handleIngredientChange = (i: number, value: string) => {
        if (!parsed) return;
        const ingredients = [...parsed.ingredients];
        ingredients[i] = value;
        setParsed({ ...parsed, ingredients });
    };

    const handleIngredientAdd = () => {
        if (!parsed) return;
        setParsed({ ...parsed, ingredients: [...parsed.ingredients, ""] });
    };

    const handleIngredientRemove = (i: number) => {
        if (!parsed) return;
        setParsed({ ...parsed, ingredients: parsed.ingredients.filter((_, idx) => idx !== i) });
    };

    const handleStepChange = (i: number, value: string) => {
        if (!parsed) return;
        const steps = [...parsed.steps];
        steps[i] = value;
        setParsed({ ...parsed, steps });
    };

    const handleStepAdd = () => {
        if (!parsed) return;
        setParsed({ ...parsed, steps: [...parsed.steps, ""] });
    };

    const handleStepRemove = (i: number) => {
        if (!parsed) return;
        setParsed({ ...parsed, steps: parsed.steps.filter((_, idx) => idx !== i) });
    };

    if (!parsed) {
        return (
            <UrlForm
                url={url}
                isParsing={isParsing}
                error={parseError}
                onUrlChange={setUrl}
                onSubmit={handleParse}
            />
        );
    }

    return (
        <RecipeEditForm
            parsed={parsed}
            category={category}
            isSaving={isSaving}
            onCategoryChange={setCategory}
            onTitleChange={(title) => setParsed({ ...parsed, title })}
            onIngredientChange={handleIngredientChange}
            onIngredientAdd={handleIngredientAdd}
            onIngredientRemove={handleIngredientRemove}
            onStepChange={handleStepChange}
            onStepAdd={handleStepAdd}
            onStepRemove={handleStepRemove}
            onBack={() => setParsed(null)}
            onSave={handleSave}
        />
    );
}

export default AddRecipePage;