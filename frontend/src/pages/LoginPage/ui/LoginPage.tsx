import { useMutation } from "@tanstack/react-query";
import type { ComponentType, SVGProps } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";

import type { AuthProvider } from "@recipe/common";

import { signIn } from "@/features/auth";
import CollectionIcon from "@/shared/assets/icons/icon-collection.svg?react";
import GoogleIcon from "@/shared/assets/icons/icon-google.svg?react";
import LinkIcon from "@/shared/assets/icons/icon-link.svg?react";
import SectionsIcon from "@/shared/assets/icons/icon-sections.svg?react";
import TelegramIcon from "@/shared/assets/icons/source/icon-telegram.svg?react";
import catPicture from "@/shared/assets/images/about-cat.webp";
import branch from "@/shared/assets/images/header-branch.webp";
import logo from "@/shared/assets/images/logo.webp";
import logoDark from "@/shared/assets/images/logo-dark.webp";
import { PageWrapper } from "@/shared/ui/PageWrapper";

import styles from "./LoginPage.module.scss";

type Icon = ComponentType<SVGProps<SVGSVGElement>>;

const FEATURES: { key: "import" | "organize" | "anywhere"; Icon: Icon }[] = [
    { key: "import", Icon: LinkIcon },
    { key: "organize", Icon: SectionsIcon },
    { key: "anywhere", Icon: CollectionIcon },
];

// Вход через Телеграм на сайте появится после деплоя: кнопке Телеграма нужен настоящий https-адрес
const PROVIDERS: { provider: AuthProvider; Icon: Icon; disabled?: boolean }[] = [
    { provider: "google", Icon: GoogleIcon },
    { provider: "telegram", Icon: TelegramIcon, disabled: true },
];

// Названия сервисов не переводятся
const PROVIDER_NAMES: Record<AuthProvider, string> = { google: "Google", telegram: "Telegram" };

// Сайт без входа: о приложении слева, вход справа. Телефон: всё в колонку, вход сразу под заголовком
const LoginPage = () => {
    const { t } = useTranslation(["auth", "common"]);
    // isPending держится до ухода на страницу Google: кнопки не нажать дважды, на нажатой — «Открываем Google…»
    const { mutate, isPending, isError, variables } = useMutation({ mutationFn: signIn });
    // Google вернул с ошибкой: ?error=<код> в адресе
    const [searchParams] = useSearchParams();
    const hasError = isError || searchParams.has("error");

    return (
        <PageWrapper className={styles.page}>
            <div className={styles.layout}>
                <section className={styles.intro}>
                    <img className={styles.logo} src={logo} alt={t("common:appName")} />
                    <img className={styles.logoDark} src={logoDark} alt={t("common:appName")} />
                    <h1 className={styles.title}>{t("title")}</h1>
                    <p className={styles.description}>{t("description")}</p>

                    <ul className={styles.features}>
                        {FEATURES.map(({ key, Icon }) => (
                            <li key={key} className={styles.feature}>
                                <span className={styles.featureIcon}>
                                    <Icon aria-hidden />
                                </span>
                                {t(`features.${key}`)}
                            </li>
                        ))}
                    </ul>
                </section>

                <section className={styles.card}>
                    <img className={styles.branch} src={branch} alt="" />
                    <h2 className={styles.welcome}>{t("welcome")}</h2>
                    <p className={styles.hint}>{t("hint")}</p>

                    <div className={styles.providers}>
                        {PROVIDERS.map(({ provider, Icon, disabled }) => (
                            <button
                                key={provider}
                                type="button"
                                className={styles.provider}
                                disabled={disabled || isPending}
                                onClick={() => mutate(provider)}
                            >
                                <Icon className={styles.providerIcon} aria-hidden />
                                {isPending && variables === provider ? t("opening", { provider: PROVIDER_NAMES[provider] }) : t(provider)}
                            </button>
                        ))}
                    </div>

                    {hasError ? (
                        <p className={styles.error} role="alert">{t("error")}</p>
                    ) : (
                        <p className={styles.note}>{t("newAccount")}</p>
                    )}
                </section>

                <img className={styles.cat} src={catPicture} alt="" />
            </div>
        </PageWrapper>
    );
};

export default LoginPage;
