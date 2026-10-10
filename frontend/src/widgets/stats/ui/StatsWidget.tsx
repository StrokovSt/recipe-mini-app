import { useTranslation } from "react-i18next";

import styles from "./StatsWidget.module.scss";

interface StatsWidgetProps {
    total: number;
    categories: number;
    pinterest: number;
}

interface StatItem {
    key: keyof StatsWidgetProps;
    label: string;
}

export function StatsWidget(props: StatsWidgetProps) {
    const { total, categories, pinterest } = props;
    const { t } = useTranslation("profile");

    const statsList: StatItem[] = [
        { key: "total", label: t("stats.total") },
        { key: "categories", label: t("stats.categories") },
        { key: "pinterest", label: t("stats.pinterest") },
    ];

    const values: Record<keyof StatsWidgetProps, number> = { total, categories, pinterest };

    return (
        <label className={styles.stats}>
            {statsList.map(({ key, label }) => (
                <div key={key} className={styles.item}>
                    <div className={styles.val}>
                        {values[key]}
                    </div>
                    <div className={styles.label}>
                        {label}
                    </div>
                </div>
            ))}
        </label>
    );
}