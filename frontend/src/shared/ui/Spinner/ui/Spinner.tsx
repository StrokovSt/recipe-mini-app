import SpinnerIcon from "@/shared/assets/spinner.svg?react";

import styles from "./Spinner.module.scss";

type SpinnerSize = "sm" | "md" | "lg" | "xl";

interface SpinnerProps {
    size?: SpinnerSize;
}

const SIZE_MAP: Record<SpinnerSize, number> = {
    sm: 24,
    md: 48,
    lg: 96,
    xl: 192
};

export function Spinner(props: SpinnerProps) {
    const { size = "md" } = props;
    const px = SIZE_MAP[size];

    return (
        <div className={styles.wrapper}>
            <SpinnerIcon
                className={styles.spinner}
                style={{ width: px, height: px }}
            />
        </div>
    );
}