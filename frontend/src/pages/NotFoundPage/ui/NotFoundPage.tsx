import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { AppRoute } from "@/app/router";
import { useLayoutMode } from "@/shared/lib/layout";
import { Breadcrumbs } from "@/shared/ui/Breadcrumbs";
import { IconButton } from "@/shared/ui/Buttons";
import { Message } from "@/shared/ui/Message";
import { PageHeader } from "@/shared/ui/PageHeader";
import { PageWrapper } from "@/shared/ui/PageWrapper";

import styles from "./NotFoundPage.module.scss";

// Неверная ссылка: адрес не совпал ни с одной страницей
const NotFoundPage = () => {
    const navigate = useNavigate();
    const { t } = useTranslation(["common", "footer"]);
    const mode = useLayoutMode();
    const isDesktop = mode === "desktop" || mode === "wide";

    return (
        <PageWrapper
            header={
                // Компьютер: путь к странице в шапке, заголовок в контенте. Телефон и планшет: заголовок в шапке
                isDesktop ? (
                    <PageHeader>
                        <Breadcrumbs label={t("common:breadcrumbs")} items={[{ label: t("footer:collection"), to: AppRoute.Home }, { label: t("notFound.title") }]} />
                    </PageHeader>
                ) : (
                <PageHeader className={styles.header}>
                    <IconButton
                        icon="back"
                        round
                        className={styles.back}
                        type="button"
                        aria-label={t("back")}
                        onClick={() => navigate(AppRoute.Home)}
                    />
                </PageHeader>
                )
            }
        >
            <Message illustration="error" title={t("notFound.title")} text={t("notFound.text")} />
        </PageWrapper>
    );
};

export default NotFoundPage;
