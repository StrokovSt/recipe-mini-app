import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { AppRoute } from "@/app/router";
import { useDrafts } from "@/entities/draft";
import { useLayoutMode } from "@/shared/lib/layout";
import { Breadcrumbs } from "@/shared/ui/Breadcrumbs";
import { IconButton } from "@/shared/ui/Buttons";
import { useLoader } from "@/shared/ui/GlobalLoader";
import { Message } from "@/shared/ui/Message";
import { PageHeader } from "@/shared/ui/PageHeader";
import { PageTitle } from "@/shared/ui/PageTitle";
import { PageWrapper } from "@/shared/ui/PageWrapper";
import { DraftList } from "@/widgets/DraftList";

import styles from "./DraftsPage.module.scss";

// Все черновики: на странице «Новый рецепт» видны только последние
const DraftsPage = () => {
    const { t } = useTranslation(["recipeForm", "common", "footer"]);
    const mode = useLayoutMode();
    const isDesktop = mode === "desktop" || mode === "wide";
    const navigate = useNavigate();
    const { data: drafts = [], isLoading } = useDrafts();

    useLoader(isLoading);
    if (isLoading) return null;

    return (
        <PageWrapper
            header={
                // Компьютер: путь к странице в шапке, заголовок в контенте. Телефон и планшет: заголовок в шапке
                isDesktop ? (
                    <PageHeader>
                        <Breadcrumbs label={t("common:breadcrumbs")} items={[{ label: t("footer:collection"), to: AppRoute.Home }, { label: t("choose.title"), to: AppRoute.AddRecipe }, { label: t("drafts.title") }]} />
                    </PageHeader>
                ) : (
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
                )
            }
        >
            {isDesktop && <PageTitle title={t("drafts.title")} hint={t("drafts.hint")} />}
            {drafts.length > 0 ? (
                <DraftList drafts={drafts} />
            ) : (
                <Message illustration="empty" title={t("drafts.empty.title")} text={t("drafts.empty.text")} />
            )}
        </PageWrapper>
    );
};

export default DraftsPage;
