import { MESSAGE_ILLUSTRATIONS, type MessageIllustration } from "../config/illustrations";

import styles from "./Message.module.scss";

interface MessageProps {
    title: string;
    text?: string;
    // Картинка над заголовком
    illustration?: MessageIllustration;
}

// Сообщение по центру страницы: рецепт не найден, неверная ссылка и т.п.
export function Message(props: MessageProps) {
    const { title, text, illustration } = props;

    return (
        <div className={styles.message}>
            {illustration && <img className={styles.image} src={MESSAGE_ILLUSTRATIONS[illustration]} alt="" />}
            <h2 className={styles.title}>{title}</h2>
            {text && <p className={styles.text}>{text}</p>}
        </div>
    );
}
