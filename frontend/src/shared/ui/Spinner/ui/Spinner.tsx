import SpinnerIcon from "@/shared/assets/spinner.svg?react";
import catLoaderWebm from "@/shared/assets/video/cat-loader-480.webm";
import catLoaderMp4 from "@/shared/assets/video/cat-loader-preview.mp4";

import styles from "./Spinner.module.scss";

type SpinnerSize = "sm" | "md" | "lg" | "xl";

interface SpinnerProps {
    size?: SpinnerSize;
}

export function Spinner(props: SpinnerProps) {
    const { size = "md" } = props;

    return (
        <div className={styles.wrapper}>
            {size === "sm" ? (
                <SpinnerIcon className={styles.spinner} />
            ) : (
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
            )}
        </div>
    );
}
