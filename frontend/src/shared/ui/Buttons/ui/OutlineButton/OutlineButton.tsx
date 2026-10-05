import clsx from "clsx";

import styles from "./OutlineButton.module.scss";

interface OutlineButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    label: string;
    dashed?: boolean;
}

export const OutlineButton = (props: OutlineButtonProps) => {
    const { label, dashed = false, className, children, ...rest } = props;

    return (
        <button className={clsx(styles.btn, dashed && styles.btnDashed, className)} {...rest}>
            {children ?? label}
        </button>
    );
};