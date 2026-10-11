import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";

import { parsedToFormValues, type RecipeDraftState, RecipeForm } from "@/features/recipe-form";
import { PageWrapper } from "@/shared/ui/PageWrapper";

// Форма нового рецепта: пустая или с черновиком, который распознал ИИ на экране импорта
const CreateRecipePage = () => {
    const { t } = useTranslation("recipeForm");
    const parsed = (useLocation().state as RecipeDraftState | null)?.parsed;

    return (
        <PageWrapper>
            <RecipeForm
                title={t("form.newTitle")}
                subtitle={parsed ? t("form.aiSubtitle") : t("form.newSubtitle")}
                defaultValues={parsed && parsedToFormValues(parsed)}
                source={parsed}
                submitLabel={t("submitAdd")}
            />
        </PageWrapper>
    );
};

export default CreateRecipePage;
