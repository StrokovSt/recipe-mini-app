import clsx from "clsx";

import { ButtonIcons } from "../../lib/icons";

import styles from "./AddTile.module.scss";

interface AddTileProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    label: string;
}

export const AddTile = (props: AddTileProps) => {
    const { label, className, ...rest } = props;

    return (
        <button type="button" className={clsx(styles.tile, className)} {...rest}>
            {ButtonIcons.add}
            {label}
        </button>
    );
};
