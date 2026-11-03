import clsx from "clsx";
import { Fragment } from "react";
import { Link } from "react-router-dom";

import styles from "./Breadcrumbs.module.scss";

export interface BreadcrumbItem {
    label: string;
    // Без ссылки пункт просто текст
    to?: string;
}

interface BreadcrumbsProps {
    items: BreadcrumbItem[];
    // Название пути для экранного диктора
    label: string;
    className?: string;
}

// Путь к странице в шапке на компьютере: «Коллекция / Супы / Борщ». Последний пункт — текущая страница
export const Breadcrumbs = (props: BreadcrumbsProps) => {
    const { items, label, className } = props;

    return (
        <nav className={clsx(styles.breadcrumbs, className)} aria-label={label}>
            {items.map((item, index) => {
                const isCurrent = index === items.length - 1;

                return (
                    <Fragment key={item.label}>
                        {index > 0 && <span aria-hidden>/</span>}
                        {isCurrent ? (
                            <span className={styles.current} aria-current="page">{item.label}</span>
                        ) : item.to ? (
                            <Link to={item.to}>{item.label}</Link>
                        ) : (
                            <span>{item.label}</span>
                        )}
                    </Fragment>
                );
            })}
        </nav>
    );
};
