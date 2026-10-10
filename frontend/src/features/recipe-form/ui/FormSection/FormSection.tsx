import type { ReactNode } from "react";

import styles from "./FormSection.module.scss";

interface FormSectionProps {
    title: string;
    // Действие справа от заголовка, например «+ Шаг»
    action?: ReactNode;
    children: ReactNode;
}

// Секция формы рецепта: заголовок с действием и содержимое
const FormSection = (props: FormSectionProps) => {
    const { title, action, children } = props;

    return (
        <section className={styles.section}>
            <div className={styles.head}>
                <h2 className={styles.title}>{title}</h2>
                {action}
            </div>
            {children}
        </section>
    );
};

export default FormSection;
