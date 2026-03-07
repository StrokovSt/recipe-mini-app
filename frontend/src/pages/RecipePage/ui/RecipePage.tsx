import { useNavigate, useParams } from "react-router-dom";

import { AppRoute } from "@/app/router";
import { useDeleteRecipe, useRecipe } from "@/entities/recipe";
import { Spinner } from "@/shared/ui/Spinner";

import { RecipeContent } from "./RecipeContent/RecipeContent";
import { RecipeHero } from "./RecipeHero/RecipeHero";
import { RecipeMeta } from "./RecipeMeta/RecipeMeta";

import styles from "./RecipePage.module.scss";

const RecipePage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const { data: recipe, isLoading, isError } = useRecipe(id!);
    const { mutate: deleteRecipe } = useDeleteRecipe();

    if (isLoading) return <Spinner size="xl" />;
    if (isError || !recipe) return <div className={styles.notFound}>Рецепт не найден</div>;

    const video = recipe.media.find((m) => m.type === "video");
    const image = recipe.media.find((m) => m.type === "image");
    const tags = recipe.tags.map((t) => t.tag.name);

    const handleDelete = () => {
        deleteRecipe(recipe.id, { onSuccess: () => navigate(AppRoute.Home) });
    };

    return (
        <main className={styles.page}>
            <RecipeHero
                title={recipe.title}
                category={recipe.category?.name}
                videoUrl={video?.url}
                imageUrl={image?.url}
                onBack={() => navigate(AppRoute.Home)}
            />

            <RecipeMeta
                time={recipe.time}
                servings={recipe.servings}
                tags={tags}
                sourceUrl={recipe.sourceUrl}
                telegraphUrl={recipe.telegraphUrl}
            />

            <RecipeContent
                ingredients={recipe.ingredients}
                steps={recipe.steps}
            />

            <div className={styles.danger}>
                <button className={styles.deleteBtn} onClick={handleDelete}>
                    Удалить рецепт
                </button>
            </div>
        </main>
    );
};

export default RecipePage;