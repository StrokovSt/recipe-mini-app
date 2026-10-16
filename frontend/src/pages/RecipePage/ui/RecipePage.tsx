import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";

import { AppRoute } from "@/app/router";
import { buildRoute } from "@/app/router/routes";
import { getRecipeSource, useDeleteRecipe, useRecipe } from "@/entities/recipe";
import DeleteIcon from "@/shared/assets/icons/icon-delete.svg?react";
import EditIcon from "@/shared/assets/icons/icon-edit.svg?react";
import { shareLink } from "@/shared/lib/share";
import { IconButton } from "@/shared/ui/Buttons";
import { Dropdown } from "@/shared/ui/Dropdown";
import { useLoader } from "@/shared/ui/GlobalLoader";
import { MediaLightbox } from "@/shared/ui/MediaLightbox";
import { ConfirmModal } from "@/shared/ui/Modal";
import { PageHeader } from "@/shared/ui/PageHeader";
import { PageWrapper } from "@/shared/ui/PageWrapper";

import { RecipeContent } from "./RecipeContent/RecipeContent";
import { RecipeHero } from "./RecipeHero/RecipeHero";
import { RecipeInfo } from "./RecipeInfo/RecipeInfo";
import { SourceBadge } from "./SourceBadge/SourceBadge";

import styles from "./RecipePage.module.scss";

// Сколько висит галочка «Ссылка скопирована» на кнопке «Поделиться»
const COPIED_HINT_MS = 2000;

const RecipePage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { t } = useTranslation(["recipe", "common"]);
    // Фото и индекс не сбрасываем при закрытии: окно гаснет плавно и до конца показывает то же фото
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);
    const [lightboxPhotos, setLightboxPhotos] = useState<string[]>([]);
    const [lightboxIndex, setLightboxIndex] = useState(0);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [isLinkCopied, setIsLinkCopied] = useState(false);

    const { data: recipe, isLoading, isError } = useRecipe(id!);
    const { mutate: deleteRecipe } = useDeleteRecipe();
    useLoader(isLoading);

    if (isLoading) return null;
    if (isError || !recipe) return <div className={styles.notFound}>{t("notFound")}</div>;

    const images = recipe.media.filter((m) => m.type === "image");
    const video = recipe.media.find((m) => m.type === "video");
    const cover = images[0];
    const source = getRecipeSource(recipe);
    const totalTime = (recipe.prepTime ?? 0) + (recipe.cookTime ?? 0);

    const handleDelete = () => {
        deleteRecipe(recipe.id, { onSuccess: () => navigate(AppRoute.Home) });
    };

    // Обложка или фото одного шага на весь экран
    const openLightbox = (photos: string[], index: number) => {
        setLightboxPhotos(photos);
        setLightboxIndex(index);
        setIsLightboxOpen(true);
    };

    // Делимся публичной Telegraph-страницей: сам рецепт в приложении видит только автор
    const handleShare = async () => {
        if (!recipe.telegraphUrl) return;

        const result = await shareLink(recipe.telegraphUrl, recipe.title);
        if (result === "copied") {
            setIsLinkCopied(true);
            setTimeout(() => setIsLinkCopied(false), COPIED_HINT_MS);
        }
    };

    return (
        <PageWrapper
            className={styles.page}
            header={
                <PageHeader className={styles.header}>
                    {recipe.telegraphUrl && (
                        <IconButton
                            icon={isLinkCopied ? "check" : "share"}
                            round
                            type="button"
                            aria-label={t(isLinkCopied ? "shareCopied" : "share")}
                            onClick={handleShare}
                        />
                    )}
                    <Dropdown
                        trigger={<IconButton icon="more" round type="button" aria-label={t("actions")} />}
                        items={[
                            { label: t("common:edit"), icon: <EditIcon />, onClick: () => navigate(buildRoute.editRecipe(recipe.id)) },
                            { label: t("common:delete"), icon: <DeleteIcon />, danger: true, onClick: () => setIsConfirmOpen(true) },
                        ]}
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
                imageUrl={cover?.url}
                videoUrl={video?.url}
                source={source}
                onImageClick={() => openLightbox(images.map((image) => image.url), 0)}
            />

            {/* Без обложки плашке источника негде лежать — ставим её над названием */}
            {!cover && !video && source && <SourceBadge source={source} />}

            <RecipeInfo
                title={recipe.title}
                category={recipe.category.name}
                description={recipe.description}
                time={totalTime}
                tags={recipe.tags.map(({ tag }) => tag)}
                nutrition={recipe}
            />

            <RecipeContent
                ingredients={recipe.ingredients}
                steps={recipe.steps}
                servings={recipe.servings ?? 1}
                onPhotoClick={openLightbox}
            />

            <ConfirmModal
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                onConfirm={handleDelete}
                title={t("deleteTitle", { title: recipe.title })}
                text={t("deleteText")}
            />

            <MediaLightbox
                isOpen={isLightboxOpen}
                media={lightboxPhotos.map((url) => ({ url, type: "image" }))}
                index={lightboxIndex}
                onClose={() => setIsLightboxOpen(false)}
                onChange={setLightboxIndex}
            />
        </PageWrapper>
    );
};

export default RecipePage;
