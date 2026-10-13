import clsx from "clsx";
import { motion, type TargetAndTransition } from "motion/react";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import PlayIcon from "@/shared/assets/icons/icon-play.svg?react";
import { TRANSITION_BASE } from "@/shared/config/animation";
import { useCloseOnBack } from "@/shared/lib/hooks";
import { IconButton } from "@/shared/ui/Buttons";

import styles from "./RecipeVideo.module.scss";

interface RecipeVideoProps {
    url: string;
    // Заставка; без неё в превью первый кадр видео
    poster?: string;
    className?: string;
}

// preview — превью в обложке, open — видео поверх всей страницы, closing — гаснет перед возвратом в превью
type Phase = "preview" | "open" | "closing";

const PHASE_ANIMATION: Record<Phase, TargetAndTransition> = {
    preview: { opacity: 1, scale: 1, transition: { duration: 0 } },
    open: { opacity: [0, 1], scale: [0.96, 1], transition: TRANSITION_BASE },
    closing: { opacity: 0, scale: 0.96, transition: TRANSITION_BASE },
};

// Превью видео с кнопкой ▶. По тапу это же видео плавно разворачивается поверх всей страницы
// и играет со звуком, сверху справа наш крестик. Закрывается крестиком и системной «Назад».
// Видео не пересоздаётся: play() вызывается прямо в обработчике тапа, иначе iOS не даст звук
export function RecipeVideo(props: RecipeVideoProps) {
    const { url, poster, className } = props;
    const { t } = useTranslation(["recipe", "common"]);
    const videoRef = useRef<HTMLVideoElement>(null);
    const [phase, setPhase] = useState<Phase>("preview");
    const isOpen = phase !== "preview";

    const close = useCloseOnBack(phase === "open", () => setPhase("closing"));

    const open = () => {
        setPhase("open");
        void videoRef.current?.play().catch(() => undefined);
    };

    // Погасло — возвращаем в обложку уже на заставке, а не на случайном кадре
    const animationCompleteHandler = () => {
        const video = videoRef.current;
        if (phase !== "closing" || !video) return;

        setPhase("preview");
        video.pause();
        if (poster) video.load();
        else video.currentTime = 0;
    };

    return (
        <div className={clsx(styles.player, className)}>
            {poster && <img src={poster} alt="" className={styles.poster} />}

            <motion.div
                className={clsx(styles.screen, isOpen && styles.open)}
                animate={PHASE_ANIMATION[phase]}
                onAnimationComplete={animationCompleteHandler}
            >
                {/* Без заставки грузятся только метаданные, #t=0.1 нужен iOS, иначе вместо первого кадра чёрный экран */}
                <video
                    ref={videoRef}
                    src={poster ? url : `${url}#t=0.1`}
                    poster={poster}
                    className={styles.video}
                    preload={poster ? "none" : "metadata"}
                    controls={isOpen}
                    controlsList="nofullscreen"
                    playsInline
                    onClick={isOpen ? undefined : open}
                />

                {isOpen && (
                    <IconButton
                        icon="close"
                        round
                        type="button"
                        className={styles.close}
                        aria-label={t("common:close")}
                        onClick={close}
                    />
                )}
            </motion.div>

            {!isOpen && (
                <IconButton
                    round
                    type="button"
                    className={styles.play}
                    aria-label={t("playVideo")}
                    onClick={open}
                >
                    <PlayIcon />
                </IconButton>
            )}
        </div>
    );
}
