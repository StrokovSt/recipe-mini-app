import clsx from "clsx";
import { type ReactNode } from "react";
import { createPortal } from "react-dom";

import { usePageHeaderBar } from "../lib/pageHeaderContext";

import styles from "./PageHeader.module.scss";

interface PageHeaderProps {
    // Заголовок, путь к странице или кнопки (на телефоне всё здесь)
    children?: ReactNode;
    className?: string;
    // Компьютер: поиск по центру шапки и кнопки справа, каждое в своей зоне
    search?: ReactNode;
    actions?: ReactNode;
}

// Содержимое шапки страницы: порталом в общую полосу PageHeaderBar.
// На компьютере полоса разбита на зоны: слева заголовок или путь, по центру поиск, справа кнопки, с краю профиль.
// Без анимации: при смене страницы шапка меняется сразу, кнопки на тех же местах не моргают
export function PageHeader(props: PageHeaderProps) {
    const { children, className, search, actions } = props;
    const bar = usePageHeaderBar();

    if (!bar) return null;

    return createPortal(
        <>
            <div className={clsx(styles.header, className)}>{children}</div>
            {search && <div className={styles.search}>{search}</div>}
            {actions && <div className={styles.actions}>{actions}</div>}
        </>,
        bar
    );
}
