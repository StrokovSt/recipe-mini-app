import { useState } from "react";

import { useParseRecipe } from "@/entities/recipe";
import { RecipeForm, type RecipeFormValues } from "@/features/recipe-form";

import UrlBar from "./UrlBar/UrlBar";

import styles from "./AddRecipePage.module.scss";

const AddRecipePage = () => {
    const [formKey, setFormKey] = useState(0);
    const [defaultValues, setDefaultValues] = useState<Partial<RecipeFormValues>>({});

    const { mutate: parseRecipe, isPending: isParsing, error: parseError } = useParseRecipe();

    const handleParse = (url: string) => {
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
            },
        });
    };



    return (
        <div className={styles.page}>
            <UrlBar
                isParsing={isParsing}
                error={parseError}
                onSubmit={handleParse}
            />

            <RecipeForm
                key={formKey}
                defaultValues={defaultValues}
                submitLabel="Сохранить рецепт"
            />
        </div>
    );
};

export default AddRecipePage;