import { motion } from "motion/react";
import { createPortal } from "react-dom";

import SpinnerIcon from "@/shared/assets/spinner.svg?react";
import catLoaderWebm from "@/shared/assets/video/cat-loader-480.webm";
import catLoaderMp4 from "@/shared/assets/video/cat-loader-preview.mp4";
import { TRANSITION_BASE } from "@/shared/config/animation";

import styles from "./Spinner.module.scss";

type SpinnerSize = "sm" | "md" | "lg" | "xl";

interface SpinnerProps {
    size?: SpinnerSize;
}

// Появление и исчезновение: проявляется из размытия, как стекло
const HIDDEN = { opacity: 0, scale: 0.94, filter: "blur(6px)" };
const VISIBLE = { opacity: 1, scale: 1, filter: "blur(0px)" };

export function Spinner(props: SpinnerProps) {
    const { size = "md" } = props;

    if (size === "sm") {
        return (
            <div className={styles.wrapper}>
                <SpinnerIcon className={styles.spinner} />
            </div>
        );
    }

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
                autoPlay
                loop
                muted
                playsInline
                aria-label="Загрузка"
            >
                <source src={catLoaderWebm} type="video/webm" />
                <source src={catLoaderMp4} type="video/mp4" />
            </video>
        </motion.div>,
        document.body
    );
}
