import { useTranslation } from "react-i18next";
import { Navigate, useLocation, useParams } from "react-router-dom";

import { AppRoute } from "@/app/router";
import { useDraft } from "@/entities/draft";
import { parsedToFormValues, type RecipeDraftData, type RecipeDraftState, RecipeForm } from "@/features/recipe-form";
import { useLoader } from "@/shared/ui/GlobalLoader";
import { PageWrapper } from "@/shared/ui/PageWrapper";

// Форма нового рецепта: пустая, открытый черновик или распознанное ИИ, если черновик создать не удалось.
// Форма сама сохраняется в черновик
const CreateRecipePage = () => {
    const { t } = useTranslation("recipeForm");
    const { id } = useParams<{ id: string }>();
    const { parsed, isImported } = (useLocation().state as RecipeDraftState | null) ?? {};
    const { data: draft, isLoading, isError } = useDraft<RecipeDraftData>(id);
    useLoader(!!id && isLoading);

    if (id && isLoading) return null;
    // Черновик удалили или он чужой: возвращаемся к выбору способа
    if (id && (isError || !draft)) return <Navigate to={AppRoute.AddRecipe} replace />;

    const isAi = draft ? draft.origin === "ai" : !!parsed;

    return (
        <PageWrapper>
            <RecipeForm
                title={t("form.newTitle")}
                subtitle={isAi ? t("form.aiSubtitle") : t("form.newSubtitle")}
                defaultValues={draft ? draft.data.values : parsed && parsedToFormValues(parsed)}
                source={draft ? { source: draft.source, sourceUrl: draft.data.sourceUrl } : parsed}
                draft={{ id: draft?.id, origin: isAi ? "ai" : "manual", isImported: !!draft && isImported }}
                submitLabel={t("submitAdd")}
            />
        </PageWrapper>
    );
};

export default CreateRecipePage;
