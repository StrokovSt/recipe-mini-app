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

const STATS_LIST: StatItem[] = [
    { key: "total", label: "Рецептов" },
    { key: "categories", label: "Категорий" },
    { key: "pinterest", label: "Pinterest" },
];

export function StatsWidget(props: StatsWidgetProps) {
    const { total, categories, pinterest } = props;

    const values: Record<keyof StatsWidgetProps, number> = { total, categories, pinterest };

    return (
        <label className={styles.stats}>
            {STATS_LIST.map(({ key, label }) => (
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