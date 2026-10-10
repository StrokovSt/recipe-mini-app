import clsx from "clsx";
import type { ReactNode } from "react";

import styles from "./SectionCard.module.scss";

interface SectionCardProps {
    title: string;
    description?: string;
    // Знак в рамке-печати справа от заголовка, например «一»
    mark?: string;
    children: ReactNode;
    className?: string;
}

// Карточка-секция, как в настройках Figma: печать с номером, заголовок, подпись и содержимое
export const SectionCard = (props: SectionCardProps) => {
    const { title, description, mark, children, className } = props;

    return (
        <section className={clsx(styles.card, className)}>
            <header className={styles.header}>
                <div>
                    <h2 className={styles.title}>{title}</h2>
                    {description && <p className={styles.description}>{description}</p>}
                </div>
                {mark && (
                    <span className={styles.mark} aria-hidden>
                        {mark}
                    </span>
                )}
            </header>

            {children}
        </section>
    );
};
