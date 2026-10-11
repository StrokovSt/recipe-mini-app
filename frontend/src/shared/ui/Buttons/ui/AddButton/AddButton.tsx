import clsx from "clsx";

import { ButtonIcons } from "../../lib/icons";

import styles from "./AddButton.module.scss";

interface AddButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    label: string;
}

// Прозрачная пилюля с винной рамкой, как «+ Группа» в Figma
export const AddButton = (props: AddButtonProps) => {
    const { label, className, ...rest } = props;

    return (
        <button className={clsx(styles.btn, className)} type="button" {...rest}>
            {ButtonIcons.add}
            {label}
        </button>
    );
};
