import { useNavigate, useParams } from "react-router-dom";

import { buildRoute } from "@/app/router/routes";
import { useRecipe, useUpdateRecipe } from "@/entities/recipe";
import { RecipeForm, type RecipeFormValues } from "@/features/recipe-form";
import { PageWrapper } from "@/shared/ui/PageWrapper";
import { Spinner } from "@/shared/ui/Spinner";

const EditRecipePage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const { data: recipe, isLoading } = useRecipe(id!);
    const { mutate: updateRecipe, isPending } = useUpdateRecipe();

    if (isLoading) return <Spinner size="xl" />;
    if (!recipe) return <div>Рецепт не найден</div>;

    const handleSubmit = (values: RecipeFormValues) => {
        updateRecipe(
            {
                id: recipe.id,
                title: values.title,
                categoryId: values.categoryId,
                ingredients: values.ingredients,
                steps: values.steps,
                time: values.time ?? null,
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
                    categoryId: recipe.categoryId,
                    ingredients: recipe.ingredients,
                    steps: recipe.steps,
                    time: recipe.time ?? undefined,
                    servings: recipe.servings ?? undefined,
                    tagIds: recipe.tags.map((t) => t.tagId),
                    media: recipe.media.map((m) => ({ url: m.url, type: m.type })),
                }}
                onSubmit={handleSubmit}
                isPending={isPending}
                submitLabel="Сохранить изменения"
            />
        </PageWrapper>
    );
};

export default EditRecipePage;