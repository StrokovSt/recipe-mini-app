import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { AppRoute } from "@/app/router";
import seal from "@/shared/assets/images/seal.webp";
import { useLayoutMode } from "@/shared/lib/layout";
import { Breadcrumbs } from "@/shared/ui/Breadcrumbs";
import { IconButton } from "@/shared/ui/Buttons";
import { PageHeader } from "@/shared/ui/PageHeader";
import { PageTitle } from "@/shared/ui/PageTitle";
import { PageWrapper } from "@/shared/ui/PageWrapper";
import { SectionCard } from "@/shared/ui/SectionCard";

import { version } from "../../../../package.json";

import styles from "./AboutPage.module.scss";

const FEATURES = ["import", "sources", "nutrition"] as const;

// Коротко о приложении: печать с названием, описание, версия и что умеет
const AboutPage = () => {
    const navigate = useNavigate();
    const { t } = useTranslation(["about", "common", "footer"]);
    const mode = useLayoutMode();
    const isDesktop = mode === "desktop" || mode === "wide";

    return (
        <PageWrapper
            className={styles.page}
            header={
                // Компьютер: путь к странице в шапке, заголовок в контенте. Телефон и планшет: заголовок в шапке
                isDesktop ? (
                    <PageHeader>
                        <Breadcrumbs label={t("common:breadcrumbs")} items={[{ label: t("footer:collection"), to: AppRoute.Home }, { label: t("title") }]} />
                    </PageHeader>
                ) : (
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
                )
            }
        >
            {isDesktop && <PageTitle title={t("title")} hint={t("subtitle")} />}
            <section className={styles.hero}>
                {/* Название уже на печати, отдельной подписью не дублируем */}
                <img className={styles.stamp} src={seal} alt={t("common:appName")} />
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
