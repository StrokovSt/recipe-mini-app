import { type ReactNode, useState } from "react";
import { useTranslation } from "react-i18next";

import type { DraftSummary } from "@recipe/common";

import { buildRoute } from "@/app/router/routes";
import { DraftItem, useDeleteDraft } from "@/entities/draft";
import { ConfirmModal } from "@/shared/ui/Modal";

import styles from "./DraftList.module.scss";

interface DraftListProps {
    drafts: DraftSummary[];
    // Строки над черновиками, например рецепты, которые ещё распознаются
    children?: ReactNode;
}

// Список черновиков: плитка открывает черновик, удаление спрашивает подтверждение
export const DraftList = ({ drafts, children }: DraftListProps) => {
    const { t } = useTranslation("recipeForm");
    const { mutate: removeDraft } = useDeleteDraft();
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    // Не сбрасываем при закрытии, иначе заголовок окна меняется во время анимации
    const [deletingDraft, setDeletingDraft] = useState<DraftSummary | null>(null);

    const askDelete = (draft: DraftSummary) => {
        setDeletingDraft(draft);
        setIsConfirmOpen(true);
    };

    const closeConfirm = () => setIsConfirmOpen(false);

    const confirmDelete = () => {
        if (deletingDraft) removeDraft(deletingDraft.id);
        closeConfirm();
    };

    return (
        <>
            <div className={styles.list}>
                {children}
                {drafts.map((draft) => (
                    <DraftItem key={draft.id} draft={draft} to={buildRoute.draft(draft.id)} onDelete={askDelete} />
                ))}
            </div>

            <ConfirmModal
                isOpen={isConfirmOpen}
                onClose={closeConfirm}
                onConfirm={confirmDelete}
                title={t("drafts.deleteTitle", { name: deletingDraft?.title || t("drafts.untitled") })}
                text={t("drafts.deleteText")}
            />
        </>
    );
};
