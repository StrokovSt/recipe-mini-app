import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { useDrafts } from "@/entities/draft";
import { IconButton } from "@/shared/ui/Buttons";
import { useLoader } from "@/shared/ui/GlobalLoader";
import { Message } from "@/shared/ui/Message";
import { PageHeader } from "@/shared/ui/PageHeader";
import { PageWrapper } from "@/shared/ui/PageWrapper";
import { DraftList } from "@/widgets/DraftList";

import styles from "./DraftsPage.module.scss";

// Все черновики: на странице «Новый рецепт» видны только последние
const DraftsPage = () => {
    const { t } = useTranslation(["recipeForm", "common"]);
    const navigate = useNavigate();
    const { data: drafts = [], isLoading } = useDrafts();

    useLoader(isLoading);
    if (isLoading) return null;

    return (
        <PageWrapper
            header={
                <PageHeader className={styles.header}>
                    <div>
                        <h1 className={styles.title}>{t("drafts.title")}</h1>
                        <p className={styles.subtitle}>{t("drafts.hint")}</p>
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
            {drafts.length > 0 ? (
                <DraftList drafts={drafts} />
            ) : (
                <Message illustration="empty" title={t("drafts.empty.title")} text={t("drafts.empty.text")} />
            )}
        </PageWrapper>
    );
};

export default DraftsPage;
