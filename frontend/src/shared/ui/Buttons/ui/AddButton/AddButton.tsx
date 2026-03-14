import clsx from "clsx";

import { ButtonIcons } from "../../lib/icons";

import styles from "./AddButton.module.scss";

interface AddButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    label: string;
}

export const AddButton = (props: AddButtonProps) => {
    const { label, className, ...rest } = props;

    return (
        <button className={clsx(styles.btn, className)} type="button" {...rest}>
            <span className={styles.label}>{label}</span>
            <span className={styles.icon}>{ButtonIcons.add}</span>
        </button>
    );
};