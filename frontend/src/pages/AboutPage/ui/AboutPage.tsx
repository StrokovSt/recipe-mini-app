import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { IconButton } from "@/shared/ui/Buttons";
import { PageHeader } from "@/shared/ui/PageHeader";
import { PageWrapper } from "@/shared/ui/PageWrapper";

import styles from "./AboutPage.module.scss";

const AboutPage = () => {
    const navigate = useNavigate();
    const { t } = useTranslation(["about", "common"]);

    return (
        <PageWrapper
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
            <p className={styles.placeholder}>{t("placeholder")}</p>
        </PageWrapper>
    );
};

export default AboutPage;
