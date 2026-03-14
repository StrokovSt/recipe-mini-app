import { useCallback, useState } from "react";

import { IconButton } from "@/shared/ui/Buttons";

import styles from "./RecipeHero.module.scss";

interface RecipeHeroProps {
    title: string;
    category?: string;
    videoUrl?: string;
    imageUrl?: string;
    onBack: () => void;
    onImageClick?: () => void;
}

export function RecipeHero(props: RecipeHeroProps) {
    const { title, category, videoUrl, imageUrl, onBack, onImageClick } = props;
    const [videoOpen, setVideoOpen] = useState(false);

    const mediaClickHandler = useCallback(() => {
        if (videoUrl) {
            setVideoOpen(true);
        } else {
            onImageClick?.();
        }
    }, [videoUrl])

    return (
        <>
            <div className={styles.hero}>
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={title}
                        className={styles.media}
                        onClick={mediaClickHandler}
                        style={{ cursor: onImageClick ? "pointer" : "default" }}
                    />
                ) : (
                    <div className={styles.mediaPlaceholder} />
                )}

                <div className={styles.overlay} />

                <IconButton
                    icon="back"
                    type="button"
                    className={styles.backBtn}
                    onClick={onBack}
                />

                {videoUrl && (
                    <button className={styles.playBtn} onClick={mediaClickHandler}>▶</button>
                )}

                <div className={styles.info}>
                    {category && category !== "Без категории" && (
                        <span className={styles.category}>{category}</span>
                    )}
                    <h1 className={styles.title}>{title}</h1>
                </div>
            </div>

            {videoOpen && videoUrl && (
                <div className={styles.videoModal} onClick={() => setVideoOpen(false)}>
                    <video
                        src={videoUrl}
                        controls
                        autoPlay
                        className={styles.video}
                        onClick={(e) => e.stopPropagation()}
                    />
                    <button className={styles.closeBtn} onClick={() => setVideoOpen(false)}>✕</button>
                </div>
            )}
        </>
    );
}