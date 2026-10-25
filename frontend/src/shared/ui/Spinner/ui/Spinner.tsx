import { m } from "motion/react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";

import SpinnerIcon from "@/shared/assets/spinner.svg?react";
import { TRANSITION_BASE } from "@/shared/config/animation";

import { DEFAULT_LOADER, type LoaderName, LOADERS } from "../config/loaders";
import { getLoaderSrc } from "../lib/getLoaderSrc";

import styles from "./Spinner.module.scss";

type SpinnerSize = "sm" | "md" | "lg" | "xl";

interface SpinnerProps {
    size?: SpinnerSize;
    // Подпись под котиком, например «Распознаём рецепт…»
    label?: string;
    // Через сколько мс показать котика. Быстрая загрузка проходит без него, иначе он мелькает на долю секунды.
    // 0 — сразу, например когда пользователь сам запустил долгое действие
    delay?: number;
    // Какой котик: обычный или, например, с лупой при распознавании рецепта
    loader?: LoaderName;
}

const DEFAULT_DELAY = 300;

// Появление и исчезновение: проявляется из размытия, как стекло
const HIDDEN = { opacity: 0, transform: "scale(0.94)", filter: "blur(6px)" };
const VISIBLE = { opacity: 1, transform: "scale(1)", filter: "blur(0px)" };

export function Spinner(props: SpinnerProps) {
    const { size = "md", label, delay = DEFAULT_DELAY, loader = DEFAULT_LOADER } = props;
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

    const { poster } = LOADERS[loader];

    // Котик всегда строго по центру экрана. Портал в body, чтобы fixed
    // не зависел от transform/filter анимаций страницы
    return createPortal(
        <m.div
            className={styles.overlay}
            initial={HIDDEN}
            animate={VISIBLE}
            exit={HIDDEN}
            transition={TRANSITION_BASE}
        >
            <video
                // При другом котике видео создаётся заново, а не меняет src на ходу
                key={loader}
                className={styles[size]}
                src={getLoaderSrc(loader)}
                // Первый кадр, пока само видео не загрузилось
                poster={poster}
                autoPlay
                loop
                muted
                playsInline
                aria-label={t("loading")}
            />
            {label && <p className={styles.label}>{label}</p>}
        </m.div>,
        document.body
    );
}
