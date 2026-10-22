import clsx from "clsx";
import { motion } from "motion/react";
import type { ReactNode } from "react";

import LockIcon from "@/shared/assets/icons/icon-lock.svg?react";

import { getRiseTransition, RISE_HIDDEN, RISE_VISIBLE } from "../../lib/riseIn";

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
    // Порядковый номер: карточки выезжают снизу по очереди
    index?: number;
    onClick: () => void;
}

// Большая карточка-кнопка способа добавления рецепта
export const OptionCard = (props: OptionCardProps) => {
    const { icon, title, description, action, locked, disabled, index = 0, onClick } = props;

    return (
        <motion.button
            type="button"
            className={clsx(styles.card, locked && styles.locked)}
            disabled={disabled}
            initial={RISE_HIDDEN}
            animate={RISE_VISIBLE}
            transition={getRiseTransition(index)}
            onClick={onClick}
        >
            <span className={styles.icon}>{locked ? <LockIcon /> : icon}</span>
            <span className={styles.title}>{title}</span>
            <span className={styles.description}>{description}</span>
            <span className={styles.action}>{action}</span>
        </motion.button>
    );
};
