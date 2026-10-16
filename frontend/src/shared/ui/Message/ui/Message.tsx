import styles from "./Message.module.scss";

interface MessageProps {
    title: string;
    text?: string;
    // Картинка над заголовком
    image?: string;
}

// Сообщение по центру страницы: рецепт не найден, неверная ссылка и т.п.
export function Message(props: MessageProps) {
    const { title, text, image } = props;

    return (
        <div className={styles.message}>
            {image && <img className={styles.image} src={image} alt="" />}
            <h2 className={styles.title}>{title}</h2>
            {text && <p className={styles.text}>{text}</p>}
        </div>
    );
}
