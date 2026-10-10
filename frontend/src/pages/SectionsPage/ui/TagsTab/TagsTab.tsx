import { useState } from "react";

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
                <AddTile label="Новый тег" onClick={openCreate} />
            </div>

            <BottomSheet
                isOpen={isFormOpen}
                onClose={closeForm}
                title={editingTag ? "Редактирование" : "Новый тег"}
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
                title={`Удалить тег «${deletingTag?.name}»?`}
                text="Тег уберётся из всех рецептов, сами рецепты останутся."
            />
        </>
    );
}
