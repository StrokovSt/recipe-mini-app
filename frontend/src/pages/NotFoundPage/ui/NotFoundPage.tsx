import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { AppRoute } from "@/app/router";
import { IconButton } from "@/shared/ui/Buttons";
import { Message } from "@/shared/ui/Message";
import { PageHeader } from "@/shared/ui/PageHeader";
import { PageWrapper } from "@/shared/ui/PageWrapper";

import styles from "./NotFoundPage.module.scss";

// Неверная ссылка: адрес не совпал ни с одной страницей
const NotFoundPage = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();

    return (
        <PageWrapper
            header={
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
            }
        >
            <Message illustration="error" title={t("notFound.title")} text={t("notFound.text")} />
        </PageWrapper>
    );
};

export default NotFoundPage;
