import clsx from "clsx";
import type { ReactNode } from "react";

import styles from "./Checkbox.module.scss";

interface CheckboxProps {
    label: ReactNode;
    // Приписка справа (например, количество), её не зачёркивает
    aside?: ReactNode;
    checked: boolean;
    onChange: (checked: boolean) => void;
    className?: string;
}

// Пункт списка дел: квадрат, в котором при отметке рисуется галочка.
// Наведение зачёркивает текст, отмеченный пункт зачёркнут и приглушён. Нажимается вся строка
export const Checkbox = (props: CheckboxProps) => {
    const { label, aside, checked, onChange, className } = props;

    return (
        <label className={clsx(styles.checkbox, checked && styles.checked, className)}>
            <input
                type="checkbox"
                className={styles.input}
                checked={checked}
                onChange={(event) => onChange(event.target.checked)}
            />
            <span className={styles.label}>{label}</span>
            {aside && <span className={styles.aside}>{aside}</span>}
        </label>
    );
};
