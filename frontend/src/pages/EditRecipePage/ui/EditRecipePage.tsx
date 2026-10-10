import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";

import { buildRoute } from "@/app/router/routes";
import { useRecipe, useUpdateRecipe } from "@/entities/recipe";
import { RecipeForm, type RecipeFormValues } from "@/features/recipe-form";
import { PageWrapper } from "@/shared/ui/PageWrapper";
import { Spinner } from "@/shared/ui/Spinner";

const EditRecipePage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { t } = useTranslation(["recipeForm", "recipe"]);

    const { data: recipe, isLoading } = useRecipe(id!);
    const { mutate: updateRecipe, isPending } = useUpdateRecipe();

    if (isLoading) return <Spinner size="xl" />;
    if (!recipe) return <div>{t("recipe:notFound")}</div>;

    const handleSubmit = (values: RecipeFormValues) => {
        updateRecipe(
            {
                id: recipe.id,
                title: values.title,
                description: values.description ?? null,
                categoryId: values.categoryId,
                ingredients: values.ingredients,
                steps: values.steps,
                prepTime: values.prepTime ?? null,
                cookTime: values.cookTime ?? null,
                servings: values.servings ?? null,
                tags: values.tagIds,
                media: values.media,
            },
            { onSuccess: () => navigate(buildRoute.recipe(recipe.id)) }
        );
    };

    return (
        <PageWrapper>
            <RecipeForm
                defaultValues={{
                    title: recipe.title,
                    description: recipe.description,
                    categoryId: recipe.categoryId,
                    ingredients: recipe.ingredients,
                    steps: recipe.steps,
                    prepTime: recipe.prepTime,
                    cookTime: recipe.cookTime,
                    servings: recipe.servings ?? undefined,
                    tagIds: recipe.tags.map((t) => t.tagId),
                    media: recipe.media.map((m) => ({ url: m.url, type: m.type })),
                }}
                onSubmit={handleSubmit}
                isPending={isPending}
                submitLabel={t("submitEdit")}
            />
        </PageWrapper>
    );
};

export default EditRecipePage;