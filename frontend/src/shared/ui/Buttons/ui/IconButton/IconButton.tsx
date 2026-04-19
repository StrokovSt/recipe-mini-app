import clsx from "clsx";

import { ButtonIconName, ButtonIcons } from "../../lib/icons";

import styles from "./IconButton.module.scss";

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    icon: ButtonIconName;
    variant?: "default" | "danger" | "success" | "accent" | "empty";
}

export const IconButton = (props: IconButtonProps) => {
    const { icon, variant = "default", className, ...rest } = props;

    return (
        <button
            className={clsx(styles.btn, styles[variant], className)}
            {...rest}
        >
            {ButtonIcons[icon]}
        </button>
    );
};