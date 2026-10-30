import clsx from "clsx";
import { type ReactNode } from "react";
import { Link } from "react-router-dom";

import ForwardIcon from "@/shared/assets/icons/icon-forward.svg?react";
import MoreIcon from "@/shared/assets/icons/icon-more.svg?react";
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
    // Низкая плитка: иконка рядом с названием, ⋯ пилюлей на верхней рамке, как у шагов рецепта
    compact?: boolean;
    className?: string;
}

// Плитка раздела: вся плитка ведёт по ссылке, в углу меню действий
export const Tile = (props: TileProps) => {
    const { icon, title, to, subtitle, menu, menuLabel, row, compact, className } = props;
    const single = menu.length === 1 ? menu[0] : undefined;

    return (
        <article className={clsx(styles.tile, row && styles.row, compact && styles.compact, className)}>
            <span className={styles.icon} aria-hidden>{icon}</span>
            {/* Одно действие — сразу кнопка, меню из одного пункта не нужно */}
            {single && !compact && (
                <IconButton
                    round
                    variant={single.danger ? "danger" : "default"}
                    className={styles.more}
                    aria-label={single.label}
                    onClick={single.onClick}
                >
                    {single.icon}
                </IconButton>
            )}
            {single && compact && (
                <button type="button" className={styles.seal} aria-label={single.label} onClick={single.onClick}>
                    {single.icon}
                </button>
            )}
            {!single && (
                <Dropdown
                    trigger={
                        compact ? (
                            <button type="button" className={styles.seal} aria-label={menuLabel}>
                                <MoreIcon />
                            </button>
                        ) : (
                            <IconButton icon="more" round className={styles.more} aria-label={menuLabel} />
                        )
                    }
                    items={menu}
                />
            )}
            <Link to={to} className={styles.title}>{title}</Link>
            {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
            {!row && <ForwardIcon className={styles.arrow} aria-hidden />}
        </article>
    );
};
