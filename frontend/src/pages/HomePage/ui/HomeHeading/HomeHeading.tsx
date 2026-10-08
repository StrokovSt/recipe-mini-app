import { IconButton } from "@/shared/ui/Buttons";

import styles from "./HomeHeading.module.scss";

export function HomeHeading() {
    return (
        <div className={styles.heading}>
            <h1 className={styles.title}>Ричетта</h1>
            <IconButton icon="user" className={styles.profile} aria-label="Профиль" />
        </div>
    );
}
