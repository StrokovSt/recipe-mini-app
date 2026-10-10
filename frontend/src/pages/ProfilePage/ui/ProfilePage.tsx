import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { useCategories } from "@/entities/category";
import { useRecipes } from "@/entities/recipe";
import { IconButton } from "@/shared/ui/Buttons";
import { PageHeader } from "@/shared/ui/PageHeader";
import { PageWrapper } from "@/shared/ui/PageWrapper";
import { StatsWidget } from "@/widgets/stats";

import styles from "./ProfilePage.module.scss";

const ProfilePage = () => {
    const navigate = useNavigate();
    const { t } = useTranslation(["profile", "common"]);
    const { data: recipes = [] } = useRecipes({});
    const { data: categories = [] } = useCategories();
    const pinterest = recipes.filter((recipe) => recipe.sourceUrl?.includes("pinterest")).length;

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
            <StatsWidget total={recipes.length} categories={categories.length} pinterest={pinterest} />
            <p className={styles.placeholder}>{t("placeholder")}</p>
        </PageWrapper>
    );
};

export default ProfilePage;
