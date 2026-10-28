import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

import logo from "@/shared/assets/images/logo.webp";
import logoDark from "@/shared/assets/images/logo-dark.webp";
import { useLayoutMode } from "@/shared/lib/layout";
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
    const { t } = useTranslation(["common", "footer"]);
    // Планшет и компьютер: логотип и меню в боковой навигации, здесь название раздела
    const isPhone = useLayoutMode() === "phone";

    return (
        <div className={styles.heading}>
            {isPhone ? (
                <h1 className={styles.title}>
                    <img className={styles.logo} src={logo} alt={t("appName")} loading="lazy" />
                    {/* В тёмной теме тот же логотип со светлыми буквами. lazy: спрятанный CSS логотип браузер не качает */}
                    <img className={styles.logoDark} src={logoDark} alt={t("appName")} loading="lazy" />
                </h1>
            ) : (
                <h1 className={styles.text}>{t("footer:collection")}</h1>
            )}
            <div className={styles.actions}>
                {actions}
                {isPhone && <AppMenuButton disabled={disabled} />}
            </div>
        </div>
    );
}
