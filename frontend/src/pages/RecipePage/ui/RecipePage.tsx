import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import { AppRoute } from "@/app/router";
import { getRecipeSource, useRecipe } from "@/entities/recipe";
import { ApiError } from "@/shared/api";
import { useLayoutMode } from "@/shared/lib/layout";
import { Breadcrumbs } from "@/shared/ui/Breadcrumbs";
import { IconButton } from "@/shared/ui/Buttons";
import { useLoader } from "@/shared/ui/GlobalLoader";
import { MediaLightbox } from "@/shared/ui/MediaLightbox";
import { LoadErrorMessage, Message } from "@/shared/ui/Message";
import { PageHeader } from "@/shared/ui/PageHeader";
import { PageWrapper } from "@/shared/ui/PageWrapper";

import { RecipeActions } from "./RecipeActions/RecipeActions";
import { RecipeContent } from "./RecipeContent/RecipeContent";
import { RecipeHero } from "./RecipeHero/RecipeHero";
import { RecipeInfo } from "./RecipeInfo/RecipeInfo";
import { SourceBadge } from "./SourceBadge/SourceBadge";

import styles from "./RecipePage.module.scss";

const RecipePage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const { t } = useTranslation(["recipe", "common", "footer"]);
    const mode = useLayoutMode();
    const isDesktop = mode === "desktop" || mode === "wide";
    // Фото и индекс не сбрасываем при закрытии: окно гаснет плавно и до конца показывает то же фото
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);
    const [lightboxPhotos, setLightboxPhotos] = useState<string[]>([]);
    const [lightboxIndex, setLightboxIndex] = useState(0);

    const { data: recipe, isLoading, error, isFetching, refetch } = useRecipe(id!);
    // «Повторить» после ошибки тоже показывает котика
    useLoader(isLoading || (!recipe && isFetching));

    // Открыли из списка: возвращаемся в ту же запись истории, прокрутка и фильтры на месте.
    // Иначе (ссылка, после сохранения) — на главную
    const goBack = () => {
        if ((location.state as { fromList?: boolean } | null)?.fromList) navigate(-1);
        else navigate(AppRoute.Home);
    };

    const backButton = (
        <IconButton
            icon="back"
            round
            className={styles.back}
            type="button"
            aria-label={t("common:back")}
            onClick={goBack}
        />
    );

    if (isLoading) return null;
    // 404 — рецепта нет. Другая ошибка или нет сети — рецепт есть, но не загрузился
    if (!recipe) {
        return (
            <PageWrapper className={styles.page} header={<PageHeader className={styles.header}>{!isDesktop && backButton}</PageHeader>}>
                {error instanceof ApiError && error.status === 404 ? (
                    <Message illustration="warning" title={t("notFound.title")} text={t("notFound.text")} />
                ) : (
                    <LoadErrorMessage onRetry={() => refetch()} />
                )}
            </PageWrapper>
        );
    }

    const images = recipe.media.filter((m) => m.type === "image");
    const video = recipe.media.find((m) => m.type === "video");
    const cover = images[0];
    const source = getRecipeSource(recipe);
    const totalTime = (recipe.prepTime ?? 0) + (recipe.cookTime ?? 0);

    // Обложка или фото одного шага на весь экран
    const openLightbox = (photos: string[], index: number) => {
        setLightboxPhotos(photos);
        setLightboxIndex(index);
        setIsLightboxOpen(true);
    };

    return (
        <PageWrapper
            className={styles.page}
            header={
                // Компьютер: путь к рецепту в шапке. Телефон и планшет: только «Назад». Кнопки рецепта — в карточке
                <PageHeader className={styles.header}>
                    {isDesktop ? (
                        <Breadcrumbs
                            label={t("breadcrumbs")}
                            items={[
                                { label: t("footer:collection"), to: AppRoute.Home },
                                { label: recipe.category.name, to: `${AppRoute.Home}?category=${recipe.categoryId}` },
                                { label: recipe.title },
                            ]}
                        />
                    ) : (
                        backButton
                    )}
                </PageHeader>
            }
        >
            {/* Компьютер: крупное фото слева стоит на месте, рецепт справа прокручивается. На телефоне обёрток нет */}
            <div className={styles.layout}>
                <div className={styles.aside}>
                    <RecipeHero
                        title={recipe.title}
                        imageUrl={cover?.url}
                        videoUrl={video?.url}
                        source={source}
                        onImageClick={() => openLightbox(images.map((image) => image.url), 0)}
                    />
                </div>
                <div className={styles.main}>
                    {/* Без обложки плашке источника негде лежать — ставим её над названием */}
                    {!cover && !video && source && <SourceBadge source={source} />}

                    <RecipeInfo
                        title={recipe.title}
                        category={recipe.category.name}
                        description={recipe.description}
                        time={totalTime}
                        tags={recipe.tags.map(({ tag }) => tag)}
                        nutrition={recipe}
                        actions={<RecipeActions recipe={recipe} />}
                    />

                    <RecipeContent
                        ingredients={recipe.ingredients}
                        steps={recipe.steps}
                        servings={recipe.servings ?? 1}
                        onPhotoClick={openLightbox}
                    />
                </div>
            </div>

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
