import { type ReactNode } from "react";
import { Link } from "react-router-dom";

import ForwardIcon from "@/shared/assets/icons/icon-forward.svg?react";
import { IconButton } from "@/shared/ui/Buttons";
import { Dropdown, type DropdownItem } from "@/shared/ui/Dropdown";

import styles from "./Tile.module.scss";

interface TileProps {
    icon: ReactNode;
    title: string;
    to: string;
    subtitle?: string;
    menu: DropdownItem[];
    menuLabel: string;
}

// Плитка раздела: вся плитка ведёт по ссылке, в углу меню действий
export const Tile = (props: TileProps) => {
    const { icon, title, to, subtitle, menu, menuLabel } = props;

    return (
        <article className={styles.tile}>
            <span className={styles.icon} aria-hidden>{icon}</span>
            <Dropdown
                trigger={<IconButton icon="more" round className={styles.more} aria-label={menuLabel} />}
                items={menu}
            />
            <Link to={to} className={styles.title}>{title}</Link>
            {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
            <ForwardIcon className={styles.arrow} aria-hidden />
        </article>
    );
};
