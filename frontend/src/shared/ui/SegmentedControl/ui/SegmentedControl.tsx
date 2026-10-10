import clsx from "clsx";
import { motion } from "motion/react";
import { type ReactNode, useId } from "react";

import { TRANSITION_BASE } from "@/shared/config/animation";

import styles from "./SegmentedControl.module.scss";

export interface SegmentedOption<T extends string> {
    id: T;
    label: string;
    icon?: ReactNode;
}

interface SegmentedControlProps<T extends string> {
    options: SegmentedOption<T>[];
    value: T;
    onChange: (id: T) => void;
    className?: string;
}

// Переключатель из нескольких вариантов (тема, категории/теги):
// выбранный подсвечен винной плашкой, которая переезжает между вариантами
export const SegmentedControl = <T extends string>(props: SegmentedControlProps<T>) => {
    const { options, value, onChange, className } = props;

    // Свой layoutId у каждого переключателя, чтобы плашки разных переключателей не перепрыгивали друг к другу
    const layoutId = useId();

    return (
        <div className={clsx(styles.wrap, className)} role="radiogroup">
            {options.map((option) => {
                const isActive = option.id === value;

                return (
                    <button
                        key={option.id}
                        type="button"
                        role="radio"
                        aria-checked={isActive}
                        className={clsx(styles.option, isActive && styles.optionActive)}
                        onClick={() => onChange(option.id)}
                    >
                        {isActive && <motion.span layoutId={layoutId} className={styles.pill} transition={TRANSITION_BASE} />}
                        {option.icon}
                        {option.label}
                    </button>
                );
            })}
        </div>
    );
};
