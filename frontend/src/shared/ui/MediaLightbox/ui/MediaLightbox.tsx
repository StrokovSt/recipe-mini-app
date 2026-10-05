import { useEffect } from "react";

import { IconButton } from "@/shared/ui/Buttons";

import styles from "./MediaLightbox.module.scss";

interface MediaItem {
    url: string;
    type: "image" | "video";
}

interface MediaLightboxProps {
    media: MediaItem[];
    index: number;
    onClose: () => void;
    onChange: (index: number) => void;
}

const MediaLightbox = ({ media, index, onClose, onChange }: MediaLightboxProps) => {
    const current = media[index];
    const hasPrev = index > 0;
    const hasNext = index < media.length - 1;

    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
            if (e.key === "ArrowLeft" && hasPrev) onChange(index - 1);
            if (e.key === "ArrowRight" && hasNext) onChange(index + 1);
        };
        document.addEventListener("keydown", handleKey);
        return () => document.removeEventListener("keydown", handleKey);
    }, [index, hasPrev, hasNext, onClose, onChange]);

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.content} onClick={(e) => e.stopPropagation()}>
                {current.type === "image" ? (
                    <img src={current.url} className={styles.media} alt="" />
                ) : (
                    <video src={current.url} className={styles.media} controls autoPlay />
                )}

                <IconButton
                    icon="close"
                    type="button"
                    className={styles.closeBtn}
                    onClick={onClose}
                />

                {hasPrev && (
                    <IconButton
                        icon="back"
                        type="button"
                        className={styles.prevBtn}
                        onClick={() => onChange(index - 1)}
                    />
                )}

                {hasNext && (
                    <IconButton
                        icon="forward"
                        type="button"
                        className={styles.nextBtn}
                        onClick={() => onChange(index + 1)}
                    />
                )}

                {media.length > 1 && (
                    <div className={styles.dots}>
                        {media.map((_, i) => (
                            <button
                                key={i}
                                type="button"
                                className={`${styles.dot} ${i === index ? styles.dotActive : ""}`}
                                onClick={() => onChange(i)}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MediaLightbox;