import clsx from "clsx";
import { useTranslation } from "react-i18next";

import { IconButton } from "@/shared/ui/Buttons";

import styles from "./Stepper.module.scss";

interface StepperProps {
    value: number;
    onChange: (value: number) => void;
    min?: number;
    max?: number;
    className?: string;
}

// Число с круглыми кнопками «−» и «+», как счётчик порций в прототипе
export const Stepper = (props: StepperProps) => {
    const { value, onChange, min = 1, max = 99, className } = props;
    const { t } = useTranslation();

    return (
        <div className={clsx(styles.stepper, className)}>
            <IconButton
                icon="minus"
                round
                type="button"
                aria-label={t("decrease")}
                disabled={value <= min}
                onClick={() => onChange(value - 1)}
            />
            <output className={styles.value} aria-live="polite">{value}</output>
            <IconButton
                icon="add"
                round
                type="button"
                aria-label={t("increase")}
                disabled={value >= max}
                onClick={() => onChange(value + 1)}
            />
        </div>
    );
};
