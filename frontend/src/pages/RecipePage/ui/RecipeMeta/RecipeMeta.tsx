import styles from "./RecipeMeta.module.scss";

interface RecipeMetaProps {
    time?: string | null;
    servings?: number | null;
    tags: string[];
    sourceUrl?: string | null;
    telegraphUrl?: string | null;
}

export function RecipeMeta(props: RecipeMetaProps) {
    const { time, servings, tags, sourceUrl, telegraphUrl } = props;

    const hasLinks = telegraphUrl || sourceUrl;

    return (
        <div className={styles.wrap}>
            {(time || servings) && (
                <div className={styles.stats}>
                    {time && (
                        <div className={styles.statItem}>
                            <span className={styles.statLabel}>Время</span>
                            <span className={styles.statValue}>⏱ {time}</span>
                        </div>
                    )}
                    {servings && (
                        <div className={styles.statItem}>
                            <span className={styles.statLabel}>Порций</span>
                            <span className={styles.statValue}>👤 {servings}</span>
                        </div>
                    )}
                </div>
            )}

            {tags.length > 0 && (
                <div className={styles.tags}>
                    {tags.map((tag) => (
                        <span key={tag} className={styles.tag}>#{tag}</span>
                    ))}
                </div>
            )}

            {hasLinks && (
                <div className={styles.links}>
                    {telegraphUrl && (
                        <a href={telegraphUrl} target="_blank" rel="noreferrer" className={styles.link}>
                            <span className={styles.linkIcon}>📝</span>
                            <div>
                                <div className={styles.linkTitle}>Открыть в Telegraph</div>
                                <div className={styles.linkSub}>Полная версия рецепта</div>
                            </div>
                        </a>
                    )}
                    {sourceUrl && (
                        <a href={sourceUrl} target="_blank" rel="noreferrer" className={styles.link}>
                            <span className={styles.linkIcon}>↗</span>
                            <div>
                                <div className={styles.linkTitle}>Открыть оригинал</div>
                                <div className={styles.linkSub}>Источник рецепта</div>
                            </div>
                        </a>
                    )}
                </div>
            )}
        </div>
    );
}