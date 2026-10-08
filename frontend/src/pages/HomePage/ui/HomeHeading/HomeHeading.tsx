import { useState } from "react";

import { IconButton } from "@/shared/ui/Buttons";
import { AppMenu } from "@/widgets/AppMenu";

import styles from "./HomeHeading.module.scss";

export function HomeHeading() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <div className={styles.heading}>
            <h1 className={styles.title}>Ричетта</h1>
            <IconButton
                icon="burger"
                round
                type="button"
                className={styles.menu}
                aria-label="Меню"
                aria-expanded={isMenuOpen}
                onClick={() => setIsMenuOpen(true)}
            />
            <AppMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
        </div>
    );
}
