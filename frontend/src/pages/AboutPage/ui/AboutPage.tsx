import type { ComponentType, SVGProps } from "react";
import { useTranslation } from "react-i18next";

import { AppRoute } from "@/app/router";
import ImageIcon from "@/shared/assets/icons/icon-image.svg?react";
import InfoIcon from "@/shared/assets/icons/icon-info.svg?react";
import LinkIcon from "@/shared/assets/icons/icon-link.svg?react";
import SearchIcon from "@/shared/assets/icons/icon-search.svg?react";
import aboutPicture from "@/shared/assets/images/about-cat.webp";
import seal from "@/shared/assets/images/seal.webp";
import { useGoBack } from "@/shared/lib/hooks";
import { useLayoutMode } from "@/shared/lib/layout";
import { Breadcrumbs } from "@/shared/ui/Breadcrumbs";
import { IconButton } from "@/shared/ui/Buttons";
import { PageHeader } from "@/shared/ui/PageHeader";
import { PageTitle } from "@/shared/ui/PageTitle";
import { PageWrapper } from "@/shared/ui/PageWrapper";
import { SectionCard } from "@/shared/ui/SectionCard";

import { version } from "../../../../package.json";

import styles from "./AboutPage.module.scss";

const FEATURES = ["import", "sources", "nutrition", "search"] as const;

// Иконки возможностей на компьютере
const FEATURE_ICONS: Record<(typeof FEATURES)[number], ComponentType<SVGProps<SVGSVGElement>>> = {
    import: ImageIcon,
    sources: LinkIcon,
    nutrition: InfoIcon,
    search: SearchIcon,
};

// Коротко о приложении: печать с названием, описание, версия и что умеет
const AboutPage = () => {
    const goBack = useGoBack(AppRoute.Home);
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
                        onClick={goBack}
                    />
                </PageHeader>
                )
            }
        >
            {isDesktop && <PageTitle title={t("title")} hint={t("subtitle")} />}

            {/* Компьютер: карточка, возможности плитками, фраза. Очень широкий экран: это слева, справа котик. Телефон и планшет: всё в колонку */}
            {isDesktop ? (
                <div className={styles.layout}>
                    <section className={styles.intro}>
                        <img className={styles.stamp} src={seal} alt="" />
                        <div className={styles.introText}>
                            <h2 className={styles.appName}>{t("common:appName")}</h2>
                            <p className={styles.description}>{t("description")}</p>
                            <span className={styles.version}>{t("version", { version })}</span>
                        </div>
                    </section>

                    <section className={styles.featuresBlock}>
                        <h2 className={styles.featuresTitle}>{t("features.title")}</h2>
                        <ul className={styles.featureTiles}>
                            {FEATURES.map((feature) => {
                                const Icon = FEATURE_ICONS[feature];

                                return (
                                    <li key={feature} className={styles.featureTile}>
                                        <span className={styles.featureIcon}>
                                            <Icon aria-hidden />
                                        </span>
                                        {t(`features.${feature}`)}
                                    </li>
                                );
                            })}
                        </ul>
                    </section>

                    <p className={styles.quote}>
                        <img className={styles.quoteSeal} src={seal} alt="" />
                        {t("madeWith")}
                    </p>

                    {/* Котик только на очень широком экране: на обычном компьютере содержимое на всю ширину */}
                    {mode === "wide" && <img className={styles.picture} src={aboutPicture} alt="" />}
                </div>
            ) : (
                <>
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
                </>
            )}
        </PageWrapper>
    );
};

export default AboutPage;
