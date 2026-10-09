import clsx from "clsx";

import { type ButtonIconName, ButtonIcons } from "../../lib/icons";

import styles from "./IconButton.module.scss";

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    icon: ButtonIconName;
    variant?: "default" | "danger" | "success" | "accent" | "active" | "empty";
    round?: boolean;
}

export const IconButton = (props: IconButtonProps) => {
    const { icon, variant = "default", round, className, ...rest } = props;

    return (
        <button
            className={clsx(styles.btn, styles[variant], round && styles.round, className)}
            {...rest}
        >
            {ButtonIcons[icon]}
        </button>
    );
};