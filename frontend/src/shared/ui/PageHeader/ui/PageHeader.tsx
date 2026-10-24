import clsx from "clsx";
import { type ReactNode } from "react";
import { createPortal } from "react-dom";

import { usePageHeaderBar } from "../lib/pageHeaderContext";

import styles from "./PageHeader.module.scss";

interface PageHeaderProps {
    children: ReactNode;
    className?: string;
}

// Содержимое шапки страницы: порталом в общую полосу PageHeaderBar.
// Без анимации: при смене страницы шапка меняется сразу, кнопки на тех же местах не моргают
export function PageHeader(props: PageHeaderProps) {
    const { children, className } = props;
    const bar = usePageHeaderBar();

    if (!bar) return null;

    return createPortal(
        <div className={clsx(styles.header, className)}>{children}</div>,
        bar
    );
}
