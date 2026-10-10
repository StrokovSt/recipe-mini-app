import { useTranslation } from "react-i18next";

import styles from "./RecipeMeta.module.scss";

interface RecipeMetaProps {
    // Общее время в минутах
    time?: number | null;
    servings?: number | null;
    tags: string[];
    sourceUrl?: string | null;
    telegraphUrl?: string | null;
}

export function RecipeMeta(props: RecipeMetaProps) {
    const { time, servings, tags, sourceUrl, telegraphUrl } = props;
    const { t } = useTranslation(["recipe", "common"]);

    const hasLinks = telegraphUrl || sourceUrl;

    return (
        <div className={styles.wrap}>
            {(time || servings) && (
                <div className={styles.stats}>
                    {time && (
                        <div className={styles.statItem}>
                            <span className={styles.statLabel}>{t("time")}</span>
                            <span className={styles.statValue}>⏱ {t("common:minutes", { count: time })}</span>
                        </div>
                    )}
                    {servings && (
                        <div className={styles.statItem}>
                            <span className={styles.statLabel}>{t("servings")}</span>
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
                                <div className={styles.linkTitle}>{t("telegraph.title")}</div>
                                <div className={styles.linkSub}>{t("telegraph.hint")}</div>
                            </div>
                        </a>
                    )}
                    {sourceUrl && (
                        <a href={sourceUrl} target="_blank" rel="noreferrer" className={styles.link}>
                            <span className={styles.linkIcon}>↗</span>
                            <div>
                                <div className={styles.linkTitle}>{t("source.title")}</div>
                                <div className={styles.linkSub}>{t("source.hint")}</div>
                            </div>
                        </a>
                    )}
                </div>
            )}
        </div>
    );
}