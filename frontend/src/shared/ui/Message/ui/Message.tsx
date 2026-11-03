import clsx from "clsx";
import { type ReactNode } from "react";

import { MESSAGE_ILLUSTRATIONS, type MessageIllustration } from "../config/illustrations";

import styles from "./Message.module.scss";

interface MessageProps {
    title: string;
    text?: string;
    // Картинка над заголовком
    illustration?: MessageIllustration;
    // Кнопка под текстом, например «Повторить»
    action?: ReactNode;
}

// Сообщение по центру страницы: рецепт не найден, неверная ссылка и т.п.
// Картинка ровно посередине, там же, где до неё был котик загрузки, текст под ней
export function Message(props: MessageProps) {
    const { title, text, illustration, action } = props;

    return (
        <div className={clsx(styles.message, illustration && styles.illustrated)}>
            {illustration && <img className={styles.image} src={MESSAGE_ILLUSTRATIONS[illustration]} alt="" />}
            <div className={styles.body}>
                <h2 className={styles.title}>{title}</h2>
                {text && <p className={styles.text}>{text}</p>}
                {action && <div className={styles.action}>{action}</div>}
            </div>
        </div>
    );
}
