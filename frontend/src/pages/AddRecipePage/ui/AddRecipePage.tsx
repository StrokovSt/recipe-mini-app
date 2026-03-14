import { useState } from "react";

import { ParsedRecipe } from "@recipe/common";

import { useParseRecipe, useParseRecipeFromImage } from "@/entities/recipe";
import { RecipeForm, type RecipeFormValues } from "@/features/recipe-form";
import { Tabs } from "@/shared/ui/Tabs";

import AiInput from "./AiInput/AiInput";

import styles from "./AddRecipePage.module.scss";

type Mode = "manual" | "ai";

const TABS: { id: Mode; label: string }[] = [
    { id: "manual", label: "✍️ Вручную" },
    { id: "ai", label: "✨ С помощью ИИ" },
];

const AddRecipePage = () => {
    const [mode, setMode] = useState<Mode>("manual");
    const [formKey, setFormKey] = useState(0);
    const [defaultValues, setDefaultValues] = useState<Partial<RecipeFormValues>>({});

    const { mutate: parseUrl, isPending: isParsing, error: parseUrlError } = useParseRecipe();
    const { mutate: parseImage, isPending: isParsingImage, error: parseImageError } = useParseRecipeFromImage();

    const applyParsedData = (data: ParsedRecipe) => {
        setDefaultValues({
            title: data.title,
            ingredients: data.ingredients,
            steps: data.steps,
            time: data.time ?? undefined,
            servings: data.servings ?? undefined,
            tagIds: [],
        });
        setFormKey((k) => k + 1);
        setMode("manual");
    };

    const handleParseUrl = (url: string) => {
        parseUrl(url, { onSuccess: applyParsedData });
    };

    const handleParseImage = (file: File) => {
        parseImage(file, { onSuccess: applyParsedData });
    };

    return (
        <div className={styles.page}>
            <Tabs tabs={TABS} active={mode} onChange={setMode} />

            {mode === "ai" && (
                <AiInput
                    isParsing={isParsing}
                    isParsingImage={isParsingImage}
                    error={parseUrlError ?? parseImageError}
                    onSubmitUrl={handleParseUrl}
                    onSubmitImage={handleParseImage}
                />
            )}

            <RecipeForm
                key={formKey}
                defaultValues={defaultValues}
                submitLabel="Сохранить рецепт"
            />
        </div>
    );
};

export default AddRecipePage;