import { useState } from "react";
import { useTranslation } from "react-i18next";

import type { Tag } from "@recipe/common";

import { buildRoute } from "@/app/router/routes";
import { TagItem, useDeleteTag, useTags } from "@/entities/tag";
import { TagForm } from "@/features/tag-form";
import { BottomSheet } from "@/shared/ui/BottomSheet";
import { AddTile } from "@/shared/ui/Buttons";
import { ConfirmModal } from "@/shared/ui/Modal";
import { Spinner } from "@/shared/ui/Spinner";

import styles from "./TagsTab.module.scss";

export function TagsTab() {
    const { t } = useTranslation("sections");
    const { data: tags = [], isLoading } = useTags();
    const { mutate: remove } = useDeleteTag();

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingTag, setEditingTag] = useState<Tag | null>(null);

    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [deletingTag, setDeletingTag] = useState<Tag | null>(null);

    const openCreate = () => {
        setEditingTag(null);
        setIsFormOpen(true);
    };

    const openEdit = (tag: Tag) => {
        setEditingTag(tag);
        setIsFormOpen(true);
    };

    const closeForm = () => setIsFormOpen(false);

    const askDelete = (tag: Tag) => {
        setDeletingTag(tag);
        setIsConfirmOpen(true);
    };

    const closeConfirm = () => setIsConfirmOpen(false);

    const confirmDelete = () => {
        if (deletingTag) remove(deletingTag.id);
        closeConfirm();
    };

    if (isLoading) return <Spinner size="md" />;

    return (
        <>
            <div className={styles.list}>
                {tags.map((tag) => (
                    <TagItem
                        key={tag.id}
                        tag={tag}
                        to={buildRoute.homeByTag(tag.id)}
                        onEdit={openEdit}
                        onDelete={askDelete}
                    />
                ))}
                <AddTile label={t("tags.add")} onClick={openCreate} />
            </div>

            <BottomSheet
                isOpen={isFormOpen}
                onClose={closeForm}
                title={editingTag ? t("editing") : t("tags.add")}
            >
                <TagForm
                    key={editingTag?.id ?? "new"}
                    tag={editingTag}
                    onSuccess={closeForm}
                    onCancel={closeForm}
                />
            </BottomSheet>

            <ConfirmModal
                isOpen={isConfirmOpen}
                onClose={closeConfirm}
                onConfirm={confirmDelete}
                title={t("tags.deleteTitle", { name: deletingTag?.name })}
                text={t("tags.deleteText")}
            />
        </>
    );
}
