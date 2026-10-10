import type { ReactNode } from "react";

import { AppMenuButton } from "@/widgets/AppMenu";

import styles from "./HomeHeading.module.scss";

interface HomeHeadingProps {
    // Дополнительные кнопки слева от меню
    actions?: ReactNode;
    // Кнопки неактивны, пока грузится список рецептов
    disabled?: boolean;
}

export function HomeHeading(props: HomeHeadingProps) {
    const { actions, disabled } = props;

    return (
        <div className={styles.heading}>
            <h1 className={styles.title}>Ричетта</h1>
            <div className={styles.actions}>
                {actions}
                <AppMenuButton disabled={disabled} />
            </div>
        </div>
    );
}
