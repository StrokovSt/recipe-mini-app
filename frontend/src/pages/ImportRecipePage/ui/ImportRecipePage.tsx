import { useState } from "react";
import { useTranslation } from "react-i18next";

import type { ParsedRecipe } from "@recipe/common";

import { useParseRecipe, useParseRecipeFromImage } from "@/entities/recipe";
import { getCover, RecipeForm, type RecipeFormValues } from "@/features/recipe-form";
import { PageWrapper } from "@/shared/ui/PageWrapper";

import AiInput from "./AiInput/AiInput";

import styles from "./ImportRecipePage.module.scss";

// Распознавание по ссылке или фото. Пока результат вписывается в форму на этом же экране
const ImportRecipePage = () => {
    const { t } = useTranslation("recipeForm");
    const [formKey, setFormKey] = useState(0);
    const [defaultValues, setDefaultValues] = useState<Partial<RecipeFormValues>>({});

    const { mutate: parseUrl, isPending: isParsing, error: parseUrlError } = useParseRecipe();
    const { mutate: parseImage, isPending: isParsingImage, error: parseImageError } = useParseRecipeFromImage();

    const applyParsedData = (data: ParsedRecipe) => {
        setDefaultValues({
            title: data.title,
            description: data.description,
            categoryId: data.categoryId,
            ingredients: data.ingredients,
            steps: data.steps,
            prepTime: data.prepTime,
            cookTime: data.cookTime,
            servings: data.servings ?? undefined,
            tagIds: data.tags,
            cover: getCover(data.media),
        });
        setFormKey((k) => k + 1);
    };

    const handleParseUrl = (url: string) => {
        parseUrl(url, { onSuccess: applyParsedData });
    };

    const handleParseImage = (file: File) => {
        parseImage(file, { onSuccess: applyParsedData });
    };

    return (
        <PageWrapper className={styles.page}>
            <AiInput
                isParsing={isParsing}
                isParsingImage={isParsingImage}
                error={parseUrlError ?? parseImageError}
                onSubmitUrl={handleParseUrl}
                onSubmitImage={handleParseImage}
            />

            <RecipeForm
                key={formKey}
                title={t("form.newTitle")}
                subtitle={t("form.newSubtitle")}
                defaultValues={defaultValues}
                submitLabel={t("submitAdd")}
            />
        </PageWrapper>
    );
};

export default ImportRecipePage;
