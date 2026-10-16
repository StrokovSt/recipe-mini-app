import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";

import { buildRoute } from "@/app/router/routes";
import { useRecipe, useUpdateRecipe } from "@/entities/recipe";
import { EMPTY_FORM_VALUES, getCover, getVideo, RecipeForm, type RecipeFormValues, toMedia } from "@/features/recipe-form";
import { useLoader } from "@/shared/ui/GlobalLoader";
import { PageWrapper } from "@/shared/ui/PageWrapper";

const EditRecipePage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { t } = useTranslation(["recipeForm", "recipe"]);

    const { data: recipe, isLoading } = useRecipe(id!);
    useLoader(isLoading);
    const { mutate: updateRecipe, isPending } = useUpdateRecipe();

    if (isLoading) return null;
    if (!recipe) return <div>{t("recipe:notFound")}</div>;

    const handleSubmit = (values: RecipeFormValues) => {
        updateRecipe(
            {
                id: recipe.id,
                title: values.title,
                description: values.description?.trim() || null,
                categoryId: values.categoryId,
                ingredients: values.ingredients,
                steps: values.steps,
                prepTime: values.prepTime ?? null,
                cookTime: values.cookTime ?? null,
                servings: values.servings ?? null,
                calories: values.calories ?? null,
                protein: values.protein ?? null,
                fat: values.fat ?? null,
                carbs: values.carbs ?? null,
                tags: values.tagIds,
                media: toMedia(values.cover, values.video),
            },
            { onSuccess: () => navigate(buildRoute.recipe(recipe.id)) }
        );
    };

    return (
        <PageWrapper>
            <RecipeForm
                title={t("form.editTitle")}
                subtitle={recipe.title}
                defaultValues={{
                    title: recipe.title,
                    description: recipe.description,
                    categoryId: recipe.categoryId,
                    // Рецепт без ингредиентов или шагов: в форме одна пустая строка, как в новом
                    ingredients: recipe.ingredients.length > 0 ? recipe.ingredients : EMPTY_FORM_VALUES.ingredients,
                    steps: recipe.steps.length > 0 ? recipe.steps : EMPTY_FORM_VALUES.steps,
                    prepTime: recipe.prepTime,
                    cookTime: recipe.cookTime,
                    servings: recipe.servings ?? undefined,
                    calories: recipe.calories,
                    protein: recipe.protein,
                    fat: recipe.fat,
                    carbs: recipe.carbs,
                    tagIds: recipe.tags.map((t) => t.tagId),
                    cover: getCover(recipe.media),
                    video: getVideo(recipe.media),
                }}
                onSubmit={handleSubmit}
                isPending={isPending}
                submitLabel={t("submitEdit")}
            />
        </PageWrapper>
    );
};

export default EditRecipePage;