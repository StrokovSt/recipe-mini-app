import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";

import catPoster from "@/shared/assets/images/cat-loader-poster.webp";
import SpinnerIcon from "@/shared/assets/spinner.svg?react";
import catLoaderWebm from "@/shared/assets/video/cat-loader-480.webm";
import catLoaderMp4 from "@/shared/assets/video/cat-loader-preview.mp4";
import { TRANSITION_BASE } from "@/shared/config/animation";

import styles from "./Spinner.module.scss";

type SpinnerSize = "sm" | "md" | "lg" | "xl";

interface SpinnerProps {
    size?: SpinnerSize;
    // Подпись под котиком, например «Распознаём рецепт…»
    label?: string;
    // Через сколько мс показать котика. Быстрая загрузка проходит без него, иначе он мелькает на долю секунды.
    // 0 — сразу, например когда пользователь сам запустил долгое действие
    delay?: number;
}

const DEFAULT_DELAY = 300;

// Появление и исчезновение: проявляется из размытия, как стекло
const HIDDEN = { opacity: 0, scale: 0.94, filter: "blur(6px)" };
const VISIBLE = { opacity: 1, scale: 1, filter: "blur(0px)" };

export function Spinner(props: SpinnerProps) {
    const { size = "md", label, delay = DEFAULT_DELAY } = props;
    const { t } = useTranslation();
    const [isVisible, setIsVisible] = useState(delay === 0);

    useEffect(() => {
        if (delay === 0) return;
        const timer = setTimeout(() => setIsVisible(true), delay);
        return () => clearTimeout(timer);
    }, [delay]);

    if (size === "sm") {
        return (
            <div className={styles.wrapper}>
                <SpinnerIcon className={styles.spinner} />
            </div>
        );
    }

    if (!isVisible) return null;

    // Котик всегда строго по центру экрана. Портал в body, чтобы fixed
    // не зависел от transform/filter анимаций страницы
    return createPortal(
        <motion.div
            className={styles.overlay}
            initial={HIDDEN}
            animate={VISIBLE}
            exit={HIDDEN}
            transition={TRANSITION_BASE}
        >
            <video
                className={styles[size]}
                // Первый кадр, пока само видео не загрузилось
                poster={catPoster}
                autoPlay
                loop
                muted
                playsInline
                aria-label={t("loading")}
            >
                <source src={catLoaderWebm} type="video/webm" />
                <source src={catLoaderMp4} type="video/mp4" />
            </video>
            {label && <p className={styles.label}>{label}</p>}
        </motion.div>,
        document.body
    );
}
