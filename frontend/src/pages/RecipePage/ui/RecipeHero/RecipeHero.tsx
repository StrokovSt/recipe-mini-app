import { useCallback, useState } from "react";

import styles from "./RecipeHero.module.scss";

interface RecipeHeroProps {
    title: string;
    category?: string;
    videoUrl?: string;
    imageUrl?: string;
    onImageClick?: () => void;
}

export function RecipeHero(props: RecipeHeroProps) {
    const { title, category, videoUrl, imageUrl, onImageClick } = props;
    const [videoOpen, setVideoOpen] = useState(false);

    const mediaClickHandler = useCallback(() => {
        if (videoUrl) {
            setVideoOpen(true);
        } else {
            onImageClick?.();
        }
    }, [videoUrl, onImageClick])

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