import clsx from "clsx";
import type { ReactNode } from "react";

import styles from "./SectionHeading.module.scss";

interface SectionHeadingProps {
    title: string;
    hint?: string;
    total?: string;
    // Элемент справа от заголовка (например, кнопка меню)
    action?: ReactNode;
    className?: string;
}

// Заголовок раздела: название и действие сверху, подсказка и итог («5 тегов») под ними
export const SectionHeading = (props: SectionHeadingProps) => {
    const { title, hint, total, action, className } = props;

    return (
        <div className={clsx(styles.heading, className)}>
            <h1 className={styles.title}>{title}</h1>
            {action && <div className={styles.action}>{action}</div>}
            {hint && <p className={styles.hint}>{hint}</p>}
            {total && <span className={styles.total}>{total}</span>}
        </div>
    );
};
