import { useState } from "react";

import { useParseRecipe } from "@/entities/recipe";
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

    const { mutate: parseRecipe, isPending: isParsing, error: parseError } = useParseRecipe();

    const handleParseUrl = (url: string) => {
        parseRecipe(url, {
            onSuccess: (data) => {
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
            },
        });
    };

    const handleParseImage = (file: File) => {
        // TODO: реализовать парсинг изображения
        console.log("image:", file);
    };

    return (
        <div className={styles.page}>
            <Tabs tabs={TABS} active={mode} onChange={setMode} />

            {mode === "ai" && (
                <AiInput
                    isParsing={isParsing}
                    error={parseError}
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