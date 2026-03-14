import clsx from "clsx";

import { ButtonIconName, ButtonIcons } from "../../lib/icons";

import styles from "./RegularButton.module.scss";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    label: string;
    icon?: ButtonIconName;
}

export const RegularButton = (props: ButtonProps) => {
    const { label, icon, className, ...rest } = props;

    return (
        <button className={clsx(styles.btn, className)} {...rest}>
            <span className={styles.lg}>
                {icon && (
                    <span className={styles.iconWrapper}>
                        {ButtonIcons[icon]}
                    </span>
                )}
                <span className={styles.text}>{label}</span>
            </span>
        </button>
    );
};