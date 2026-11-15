import { useMutation } from "@tanstack/react-query";
import { type ComponentType, type SVGProps, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";

import type { AuthProvider, User } from "@recipe/common";

import { useUnlinkProvider } from "@/entities/user";
import { deleteAccount, linkProvider, signOut } from "@/features/auth";
import GoogleIcon from "@/shared/assets/icons/icon-google.svg?react";
import TelegramIcon from "@/shared/assets/icons/source/icon-telegram.svg?react";
import { OutlineButton } from "@/shared/ui/Buttons";
import { ConfirmModal } from "@/shared/ui/Modal";
import { SectionCard } from "@/shared/ui/SectionCard";

import styles from "./AccountSection.module.scss";

const PROVIDERS: { provider: AuthProvider; name: string; Icon: ComponentType<SVGProps<SVGSVGElement>> }[] = [
    { provider: "google", name: "Google", Icon: GoogleIcon },
    { provider: "telegram", name: "Telegram", Icon: TelegramIcon },
];

interface Props {
    user: User;
    // В мини-аппе нет сессии сайта: Google привязывается на сайте, Телеграм не отвязать, выйти некуда
    isTelegram: boolean;
}

// Способы входа в аккаунт, выход и удаление аккаунта
export const AccountSection = ({ user, isTelegram }: Props) => {
    const { t } = useTranslation(["profile", "common"]);
    // Google вернул с ошибкой (?error=...): чаще всего этот Google уже привязан к другому аккаунту
    const [searchParams] = useSearchParams();
    const linkError = searchParams.get("error");
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);

    const link = useMutation({ mutationFn: linkProvider });
    const unlink = useUnlinkProvider();
    const leave = useMutation({ mutationFn: signOut });
    const remove = useMutation({ mutationFn: deleteAccount });

    const isBusy = link.isPending || unlink.isPending || leave.isPending || remove.isPending;
    const isFailed = link.isError || unlink.isError || leave.isError || remove.isError;
    const isLast = user.providers.length < 2;

    // Что можно сделать со способом входа: кнопка или короткая подсказка
    const renderAction = (provider: AuthProvider) => {
        if (user.providers.includes(provider)) {
            if (isLast || (isTelegram && provider === "telegram")) return null;
            return (
                <OutlineButton
                    label={t("accounts.unlink")}
                    type="button"
                    disabled={isBusy}
                    onClick={() => unlink.mutate(provider)}
                />
            );
        }

        // Вход через Телеграм на сайте появится после деплоя: кнопке Телеграма нужен настоящий https-адрес
        if (provider === "telegram") return <span className={styles.hint}>{t("accounts.soon")}</span>;
        if (isTelegram) return <span className={styles.hint}>{t("accounts.onSite")}</span>;

        return (
            <OutlineButton
                label={t("accounts.link")}
                type="button"
                disabled={isBusy}
                onClick={() => link.mutate(provider)}
            />
        );
    };

    return (
        <>
            <SectionCard title={t("accounts.title")} description={t("accounts.description")}>
                <ul className={styles.list}>
                    {PROVIDERS.map(({ provider, name, Icon }) => (
                        <li key={provider} className={styles.row}>
                            <span className={styles.icon}>
                                <Icon className={styles[provider]} aria-hidden />
                            </span>
                            <span className={styles.text}>
                                <span className={styles.name}>{name}</span>
                                <span className={styles.status}>
                                    {t(user.providers.includes(provider) ? "accounts.linked" : "accounts.notLinked")}
                                </span>
                            </span>
                            {renderAction(provider)}
                        </li>
                    ))}
                </ul>

                {(linkError || isFailed) && (
                    <p className={styles.error} role="alert">
                        {t(linkError === "account_already_linked_to_different_user" ? "accounts.taken" : "accounts.failed")}
                    </p>
                )}
            </SectionCard>

            <div className={styles.actions}>
                {!isTelegram && (
                    <OutlineButton label={t("signOut")} type="button" disabled={isBusy} onClick={() => leave.mutate()} />
                )}
                <OutlineButton
                    label={t("deleteAccount")}
                    type="button"
                    className={styles.danger}
                    disabled={isBusy}
                    onClick={() => setIsDeleteOpen(true)}
                />
            </div>

            <ConfirmModal
                isOpen={isDeleteOpen}
                onClose={() => setIsDeleteOpen(false)}
                onConfirm={() => {
                    setIsDeleteOpen(false);
                    remove.mutate();
                }}
                title={t("deleteConfirm.title")}
                text={t("deleteConfirm.text")}
                confirmLabel={t("deleteConfirm.confirm")}
            />
        </>
    );
};
