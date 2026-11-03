import clsx from "clsx";
import { type ReactNode } from "react";
import { Link } from "react-router-dom";

import ForwardIcon from "@/shared/assets/icons/icon-forward.svg?react";
import MoreIcon from "@/shared/assets/icons/icon-more.svg?react";
import { BrushPaint } from "@/shared/ui/BrushPaint";
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
    // Плитка гуашью (shared/ui/BrushPaint): цвет краски задаёт родитель через --paint*
    painted?: boolean;
    className?: string;
}

// Плитка раздела: вся плитка ведёт по ссылке, в углу меню действий
export const Tile = (props: TileProps) => {
    const { icon, title, to, subtitle, menu, menuLabel, row, compact, painted, className } = props;
    const single = menu.length === 1 ? menu[0] : undefined;

    return (
        <article className={clsx(styles.tile, row && styles.row, compact && styles.compact, painted && styles.painted, className)}>
            {painted && <BrushPaint />}
            <span className={styles.icon} aria-hidden>{icon}</span>
            {/* «⋯» пилюлей на верхней рамке. Одно действие — сразу кнопка, меню из одного пункта не нужно */}
            {single ? (
                <button type="button" className={styles.seal} aria-label={single.label} onClick={single.onClick}>
                    {single.icon}
                </button>
            ) : (
                <Dropdown
                    trigger={
                        <button type="button" className={styles.seal} aria-label={menuLabel}>
                            <MoreIcon />
                        </button>
                    }
                    items={menu}
                />
            )}
            <Link to={to} className={styles.title}>{title}</Link>
            {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
            <ForwardIcon className={styles.arrow} aria-hidden />
        </article>
    );
};
