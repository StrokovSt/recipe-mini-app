import { useTranslation } from "react-i18next";

import type { RecipeSourceInfo } from "@/entities/recipe";
import { FULL_IMAGE_WIDTH, getImageUrl } from "@/shared/lib/image";

import { RecipeVideo } from "../RecipeVideo/RecipeVideo";
import { SourceBadge } from "../SourceBadge/SourceBadge";

import styles from "./RecipeHero.module.scss";

interface RecipeHeroProps {
    title: string;
    imageUrl?: string;
    videoUrl?: string;
    source: RecipeSourceInfo | null;
    onImageClick: () => void;
}

// Обложка во всю ширину экрана от самого верха, полупрозрачная шапка лежит поверх неё.
// Есть видео — превью видео с кнопкой ▶ (фото служит заставкой), иначе фото, которое по тапу
// открывается на весь экран. Внизу слева плашка источника со ссылкой на оригинал
export function RecipeHero(props: RecipeHeroProps) {
    const { title, imageUrl, videoUrl, source, onImageClick } = props;
    const { t } = useTranslation("recipe");

    if (!imageUrl && !videoUrl) return null;

    const cover = imageUrl && getImageUrl(imageUrl, FULL_IMAGE_WIDTH);

    return (
        <div className={styles.hero}>
            {videoUrl ? (
                <RecipeVideo url={videoUrl} poster={cover} className={styles.media} />
            ) : (
                <button type="button" className={styles.media} aria-label={t("openPhoto")} onClick={onImageClick}>
                    <img src={cover} alt={title} className={styles.image} />
                </button>
            )}

            {source && <SourceBadge source={source} className={styles.badge} />}
        </div>
    );
}
