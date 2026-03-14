import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { AppRoute } from "@/app/router";
import { buildRoute } from "@/app/router/routes";
import { useDeleteRecipe, useRecipe } from "@/entities/recipe";
import { RegularButton } from "@/shared/ui/Buttons";
import { MediaLightbox } from "@/shared/ui/MediaLightbox";
import { Spinner } from "@/shared/ui/Spinner";

import { RecipeContent } from "./RecipeContent/RecipeContent";
import { RecipeHero } from "./RecipeHero/RecipeHero";
import { RecipeMeta } from "./RecipeMeta/RecipeMeta";

import styles from "./RecipePage.module.scss";

const RecipePage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

    const { data: recipe, isLoading, isError } = useRecipe(id!);
    const { mutate: deleteRecipe } = useDeleteRecipe();

    if (isLoading) return <Spinner size="xl" />;
    if (isError || !recipe) return <div className={styles.notFound}>Рецепт не найден</div>;

    const images = recipe.media.filter((m) => m.type === "image");
    const video = recipe.media.find((m) => m.type === "video");
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
                imageUrl={images[0]?.url}
                onBack={() => navigate(AppRoute.Home)}
                onImageClick={() => images.length > 0 && setLightboxIndex(0)}
            />

            <RecipeMeta
                time={recipe.time}
                servings={recipe.servings}
                tags={tags}
                sourceUrl={recipe.sourceUrl || null}
                telegraphUrl={recipe.telegraphUrl}
            />

            <RecipeContent
                ingredients={recipe.ingredients}
                steps={recipe.steps}
            />

            <div className={styles.actions}>
                <RegularButton
                    label="Редактировать"
                    icon="edit"
                    type="button"
                    onClick={() => navigate(buildRoute.editRecipe(recipe.id))}
                />

                <RegularButton
                    label="Удалить рецепт"
                    icon="delete"
                    type="button"
                    onClick={handleDelete}
                />
            </div>

            {lightboxIndex !== null && (
                <MediaLightbox
                    media={images}
                    index={lightboxIndex}
                    onClose={() => setLightboxIndex(null)}
                    onChange={setLightboxIndex}
                />
            )}
        </main>
    );
};

export default RecipePage;