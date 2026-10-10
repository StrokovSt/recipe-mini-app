import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

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
    const { t } = useTranslation();

    return (
        <div className={styles.heading}>
            <h1 className={styles.title}>{t("appName")}</h1>
            <div className={styles.actions}>
                {actions}
                <AppMenuButton disabled={disabled} />
            </div>
        </div>
    );
}
