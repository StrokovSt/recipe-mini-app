import { useState } from "react";

import styles from "./RecipeHero.module.scss";

interface RecipeHeroProps {
    title: string;
    category?: string;
    videoUrl?: string;
    imageUrl?: string;
    onBack: () => void;
}

export function RecipeHero(props: RecipeHeroProps) {
    const { title, category, videoUrl, imageUrl, onBack } = props;
    const [videoOpen, setVideoOpen] = useState(false);

    return (
        <>
            <div className={styles.hero}>
                {imageUrl ? (
                    <img src={imageUrl} alt={title} className={styles.media} />
                ) : (
                    <div className={styles.mediaPlaceholder} />
                )}

                <div className={styles.overlay} />

                <button className={styles.backBtn} onClick={onBack}>‹</button>

                {videoUrl && (
                    <button className={styles.playBtn} onClick={() => setVideoOpen(true)}>
                        ▶
                    </button>
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