import clsx from "clsx";
import { type ReactNode } from "react";
import { createPortal } from "react-dom";

import { usePageFooterSlot } from "../lib/pageFooterContext";

import styles from "./PageFooter.module.scss";

interface PageFooterProps {
    children: ReactNode;
    className?: string;
}

// Действие страницы (кнопка сохранения формы) порталом в общий футер вместо навигации.
// Плашка футера остаётся на месте, меняется только содержимое
export function PageFooter(props: PageFooterProps) {
    const { children, className } = props;
    const slot = usePageFooterSlot();

    if (!slot) return null;

    return createPortal(<div className={clsx(styles.footer, className)}>{children}</div>, slot);
}
