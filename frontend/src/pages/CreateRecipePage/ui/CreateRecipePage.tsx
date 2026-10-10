import { useTranslation } from "react-i18next";

import { RecipeForm } from "@/features/recipe-form";
import { PageWrapper } from "@/shared/ui/PageWrapper";

// Пустая форма нового рецепта
const CreateRecipePage = () => {
    const { t } = useTranslation("recipeForm");

    return (
        <PageWrapper>
            <RecipeForm
                title={t("form.newTitle")}
                subtitle={t("form.newSubtitle")}
                submitLabel={t("submitAdd")}
            />
        </PageWrapper>
    );
};

export default CreateRecipePage;
