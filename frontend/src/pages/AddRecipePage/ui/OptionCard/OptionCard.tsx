import clsx from "clsx";
import type { ReactNode } from "react";

import LockIcon from "@/shared/assets/icons/icon-lock.svg?react";

import styles from "./OptionCard.module.scss";

interface OptionCardProps {
    icon: ReactNode;
    title: string;
    description: string;
    // Подпись-действие внизу карточки
    action: string;
    // Способ недоступен аккаунту: замок вместо иконки, карточка приглушена, но нажимается
    locked?: boolean;
    disabled?: boolean;
    onClick: () => void;
}

// Большая карточка-кнопка способа добавления рецепта
export const OptionCard = (props: OptionCardProps) => {
    const { icon, title, description, action, locked, disabled, onClick } = props;

    return (
        <button
            type="button"
            className={clsx(styles.card, locked && styles.locked)}
            disabled={disabled}
            onClick={onClick}
        >
            <span className={styles.icon}>{locked ? <LockIcon /> : icon}</span>
            <span className={styles.title}>{title}</span>
            <span className={styles.description}>{description}</span>
            <span className={styles.action}>{action}</span>
        </button>
    );
};
