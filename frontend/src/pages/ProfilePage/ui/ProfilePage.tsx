import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { useCategories } from "@/entities/category";
import { useRecipes } from "@/entities/recipe";
import { LANGUAGES } from "@/shared/config/i18n";
import { getTelegram } from "@/shared/lib/telegram";
import { IconButton } from "@/shared/ui/Buttons";
import { PageHeader } from "@/shared/ui/PageHeader";
import { PageWrapper } from "@/shared/ui/PageWrapper";

import { formatTelegramId } from "../lib/formatTelegramId";

import styles from "./ProfilePage.module.scss";

const ProfilePage = () => {
    const navigate = useNavigate();
    const { t, i18n } = useTranslation(["profile", "common", "menu"]);
    const { data: recipes = [] } = useRecipes({});
    const { data: categories = [] } = useCategories();

    // Вне Телеграма данных пользователя нет: гость «Шеф», без ника и ID
    const user = getTelegram()?.initDataUnsafe?.user;
    const name = user?.first_name ?? t("menu:guest");
    const language = LANGUAGES.find(({ code }) => code === i18n.language) ?? LANGUAGES[0];

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
            <section className={styles.user}>
                {user?.photo_url ? (
                    <img className={styles.avatar} src={user.photo_url} alt="" />
                ) : (
                    <span className={styles.avatar} aria-hidden>{name[0]}</span>
                )}
                <h2 className={styles.name}>{name}</h2>
                {user?.username && <p className={styles.username}>@{user.username}</p>}
            </section>

            <div className={styles.stats}>
                <p className={styles.stat}>
                    <span className={styles.value}>{recipes.length}</span>
                    {t("stats.recipes", { count: recipes.length })}
                </p>
                <p className={styles.stat}>
                    <span className={styles.value}>{categories.length}</span>
                    {t("stats.categories", { count: categories.length })}
                </p>
            </div>

            <dl className={styles.info}>
                <div className={styles.row}>
                    <dt>{t("info.name")}</dt>
                    <dd>{name}</dd>
                </div>
                {user && (
                    <div className={styles.row}>
                        <dt>{t("info.telegramId")}</dt>
                        <dd>{formatTelegramId(user.id)}</dd>
                    </div>
                )}
                <div className={styles.row}>
                    <dt>{t("info.language")}</dt>
                    <dd>{language.nativeName}</dd>
                </div>
            </dl>

            {user && <p className={styles.synced}>{t("synced")}</p>}
        </PageWrapper>
    );
};

export default ProfilePage;
