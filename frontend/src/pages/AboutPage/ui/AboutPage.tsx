import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { IconButton } from "@/shared/ui/Buttons";
import { PageHeader } from "@/shared/ui/PageHeader";
import { PageWrapper } from "@/shared/ui/PageWrapper";
import { SectionCard } from "@/shared/ui/SectionCard";

import { version } from "../../../../package.json";

import styles from "./AboutPage.module.scss";

const FEATURES = ["import", "sources", "nutrition"] as const;

// Коротко о приложении: печать с названием, описание, версия и что умеет
const AboutPage = () => {
    const navigate = useNavigate();
    const { t } = useTranslation(["about", "common"]);

    return (
        <PageWrapper
            className={styles.page}
            header={
                <PageHeader className={styles.header}>
                    <div>
                        <h1 className={styles.title}>{t("title")}</h1>
                        <p className={styles.subtitle}>{t("subtitle")}</p>
                    </div>
                    <IconButton
                        icon="back"
                        round
                        className={styles.back}
                        type="button"
                        aria-label={t("common:back")}
                        onClick={() => navigate(-1)}
                    />
                </PageHeader>
            }
        >
            <section className={styles.hero}>
                {/* «Меню, набор блюд» по-японски, как печать */}
                <span className={styles.stamp} aria-hidden>献立</span>
                <h2 className={styles.name}>{t("common:appName")}</h2>
                <p className={styles.description}>{t("description")}</p>
                <span className={styles.version}>{t("version", { version })}</span>
            </section>

            <SectionCard mark="一" title={t("features.title")} description={t("features.description")}>
                <ul className={styles.features}>
                    {FEATURES.map((feature) => (
                        <li key={feature}>{t(`features.${feature}`)}</li>
                    ))}
                </ul>
            </SectionCard>

            <p className={styles.madeWith}>{t("madeWith")}</p>
        </PageWrapper>
    );
};

export default AboutPage;
