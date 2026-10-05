import styles from "./ErrorMessage.module.scss";

interface ErrorMessageProps {
    message: string;
}

export function ErrorMessage(props: ErrorMessageProps) {
    const { message } = props;

    return (
        <div className={styles.wrap}>
            <span className={styles.icon}>⚠️</span>
            <p className={styles.text}>{message}</p>
        </div>
    );
}