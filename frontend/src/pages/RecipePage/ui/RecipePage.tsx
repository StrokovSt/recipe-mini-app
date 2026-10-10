import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";

import { AppRoute } from "@/app/router";
import { buildRoute } from "@/app/router/routes";
import { useDeleteRecipe, useRecipe } from "@/entities/recipe";
import { IconButton } from "@/shared/ui/Buttons";
import { MediaLightbox } from "@/shared/ui/MediaLightbox";
import { ConfirmModal } from "@/shared/ui/Modal";
import { PageHeader } from "@/shared/ui/PageHeader";
import { PageWrapper } from "@/shared/ui/PageWrapper";
import { Spinner } from "@/shared/ui/Spinner";

import { RecipeContent } from "./RecipeContent/RecipeContent";
import { RecipeHero } from "./RecipeHero/RecipeHero";
import { RecipeMeta } from "./RecipeMeta/RecipeMeta";

import styles from "./RecipePage.module.scss";

const RecipePage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { t } = useTranslation(["recipe", "common"]);
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);

    const { data: recipe, isLoading, isError } = useRecipe(id!);
    const { mutate: deleteRecipe } = useDeleteRecipe();

    if (isLoading) return <Spinner size="xl" />;
    if (isError || !recipe) return <div className={styles.notFound}>{t("notFound")}</div>;

    const images = recipe.media.filter((m) => m.type === "image");
    const video = recipe.media.find((m) => m.type === "video");
    const tags = recipe.tags.map((t) => t.tag.name);

    const handleDelete = () => {
        deleteRecipe(recipe.id, { onSuccess: () => navigate(AppRoute.Home) });
    };

    const imageClickHandler = () => {
        console.log('meow')
        setLightboxIndex(0);
    }

    return (
        <PageWrapper
            className={styles.page}
            header={
                <PageHeader className={styles.header}>
                    <IconButton
                        icon="edit"
                        round
                        type="button"
                        aria-label={t("edit")}
                        onClick={() => navigate(buildRoute.editRecipe(recipe.id))}
                    />
                    <IconButton
                        icon="delete"
                        round
                        type="button"
                        variant="danger"
                        aria-label={t("delete")}
                        onClick={() => setIsConfirmOpen(true)}
                    />
                    <IconButton
                        icon="back"
                        round
                        className={styles.back}
                        type="button"
                        aria-label={t("common:back")}
                        onClick={() => navigate(AppRoute.Home)}
                    />
                </PageHeader>
            }
        >
            <RecipeHero
                title={recipe.title}
                category={recipe.category?.name}
                videoUrl={video?.url}
                imageUrl={images[0]?.url}
                onImageClick={imageClickHandler}
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

            <ConfirmModal
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                onConfirm={handleDelete}
                title={t("deleteTitle", { title: recipe.title })}
                text={t("deleteText")}
            />

            {lightboxIndex !== null && (
                <MediaLightbox
                    media={images}
                    index={lightboxIndex}
                    onClose={() => setLightboxIndex(null)}
                    onChange={setLightboxIndex}
                />
            )}
        </PageWrapper>
    );
};

export default RecipePage;