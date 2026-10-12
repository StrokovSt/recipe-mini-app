import clsx from "clsx";
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
    // Строка на всю ширину: иконка слева, название и подпись в центре, без стрелки
    row?: boolean;
}

// Плитка раздела: вся плитка ведёт по ссылке, в углу меню действий
export const Tile = (props: TileProps) => {
    const { icon, title, to, subtitle, menu, menuLabel, row } = props;

    return (
        <article className={clsx(styles.tile, row && styles.row)}>
            <span className={styles.icon} aria-hidden>{icon}</span>
            {/* Одно действие — сразу кнопка, меню из одного пункта не нужно */}
            {menu.length === 1 ? (
                <IconButton
                    round
                    variant={menu[0].danger ? "danger" : "default"}
                    className={styles.more}
                    aria-label={menu[0].label}
                    onClick={menu[0].onClick}
                >
                    {menu[0].icon}
                </IconButton>
            ) : (
                <Dropdown
                    trigger={<IconButton icon="more" round className={styles.more} aria-label={menuLabel} />}
                    items={menu}
                />
            )}
            <Link to={to} className={styles.title}>{title}</Link>
            {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
            {!row && <ForwardIcon className={styles.arrow} aria-hidden />}
        </article>
    );
};
