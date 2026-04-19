import WebApp from "@twa-dev/sdk";

import { getGreeting } from "@/shared/lib/utils";

import styles from "./UserGreeting.module.scss";

export const UserGreeting = () => {
    const user = WebApp.initDataUnsafe?.user;
    const name = user?.first_name ?? "Шэф";

    return (
        <article className={styles.container}>
            <h1>
                {`${getGreeting()}, `}
                <span>{name}</span>
            </h1>
            <p className={styles.subtitle}>Что бы вы хотели приготовить сегодня?</p>
        </article>
    );
};