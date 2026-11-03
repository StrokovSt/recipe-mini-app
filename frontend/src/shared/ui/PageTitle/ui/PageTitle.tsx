import type { ReactNode } from "react";

import styles from "./PageTitle.module.scss";

interface PageTitleProps {
    title: ReactNode;
    // Строка под названием: подсказка или итог
    hint?: ReactNode;
    // Справа от названия: кнопки, переключатель
    children?: ReactNode;
}

// Заголовок страницы в контенте на компьютере: название и подсказка слева, действия справа, черта снизу.
// На телефоне и планшете заголовок в шапке страницы
export const PageTitle = (props: PageTitleProps) => {
    const { title, hint, children } = props;

    return (
        <div className={styles.row}>
            <div>
                <h1 className={styles.title}>{title}</h1>
                {hint && <p className={styles.hint}>{hint}</p>}
            </div>
            {children}
        </div>
    );
};
