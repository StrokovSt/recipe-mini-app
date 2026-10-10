import clsx from "clsx";

import styles from "./Switch.module.scss";

interface SwitchProps {
    label: string;
    description?: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
    className?: string;
}

// Строка-тумблер, как в настройках Figma: подпись слева, переключатель справа, нажимается вся строка
export const Switch = (props: SwitchProps) => {
    const { label, description, checked, onChange, className } = props;

    return (
        <label className={clsx(styles.row, className)}>
            <span className={styles.label}>{label}</span>
            {description && <span className={styles.description}>{description}</span>}
            <input
                type="checkbox"
                role="switch"
                className={styles.switch}
                checked={checked}
                onChange={(event) => onChange(event.target.checked)}
            />
        </label>
    );
};
