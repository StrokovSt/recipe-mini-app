import { useState } from "react";
import { useTranslation } from "react-i18next";

import type { ParsedRecipe } from "@recipe/common";

import { useParseRecipe, useParseRecipeFromImage } from "@/entities/recipe";
import { RecipeForm, type RecipeFormValues } from "@/features/recipe-form";
import { PageWrapper } from "@/shared/ui/PageWrapper";
import { Tabs } from "@/shared/ui/Tabs";

import AiInput from "./AiInput/AiInput";

import styles from "./AddRecipePage.module.scss";

type Mode = "manual" | "ai";

const AddRecipePage = () => {
    const { t } = useTranslation("recipeForm");
    const [mode, setMode] = useState<Mode>("manual");
    const [formKey, setFormKey] = useState(0);
    const [defaultValues, setDefaultValues] = useState<Partial<RecipeFormValues>>({});

    const { mutate: parseUrl, isPending: isParsing, error: parseUrlError } = useParseRecipe();
    const { mutate: parseImage, isPending: isParsingImage, error: parseImageError } = useParseRecipeFromImage();

    const tabs: { id: Mode; label: string }[] = [
        { id: "manual", label: t("modes.manual") },
        { id: "ai", label: t("modes.ai") },
    ];

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
        <PageWrapper className={styles.page}>
            <Tabs tabs={tabs} active={mode} onChange={setMode} />

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
                submitLabel={t("submitAdd")}
            />
        </PageWrapper>
    );
};

export default AddRecipePage;