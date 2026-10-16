import clsx from "clsx";
import { type CSSProperties, type ReactNode } from "react";

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

    // Плашка одна и сдвигается на индекс выбранного варианта. Без layoutId: он мерил позицию на экране
    // и на телефоне плашка прилетала снизу, когда под переключателем менялась высота контента
    const index = options.findIndex((option) => option.id === value);
    const pillStyle = { "--count": options.length, "--index": index } as CSSProperties;

    return (
        <div className={clsx(styles.wrap, className)} role="radiogroup">
            {index >= 0 && <span className={styles.pill} style={pillStyle} />}
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
                        {option.icon}
                        {option.label}
                    </button>
                );
            })}
        </div>
    );
};
