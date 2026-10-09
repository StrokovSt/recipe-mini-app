import clsx from "clsx";

import { type ButtonIconName, ButtonIcons } from "../../lib/icons";

import styles from "./RegularButton.module.scss";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    label: string;
    icon?: ButtonIconName;
}

// Основная кнопка действия: скруглённая, винная
export const RegularButton = (props: ButtonProps) => {
    const { label, icon, className, ...rest } = props;

    return (
        <button className={clsx(styles.btn, className)} {...rest}>
            {icon && ButtonIcons[icon]}
            {label}
        </button>
    );
};
