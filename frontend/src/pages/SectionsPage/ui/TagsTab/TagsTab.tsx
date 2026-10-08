import { useState } from "react";

import { Tag } from "@recipe/common";

import { TagItem, useDeleteTag, useTags } from "@/entities/tag";
import { TagForm } from "@/features/tag-form";
import { BottomSheet } from "@/shared/ui/BottomSheet";
import { AddTile } from "@/shared/ui/Buttons";
import { Spinner } from "@/shared/ui/Spinner";

import styles from "./TagsTab.module.scss";

export function TagsTab() {
    const { data: tags = [], isLoading } = useTags();
    const { mutate: remove } = useDeleteTag();

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingTag, setEditingTag] = useState<Tag | null>(null);

    const openCreate = () => {
        setEditingTag(null);
        setIsFormOpen(true);
    };

    const openEdit = (tag: Tag) => {
        setEditingTag(tag);
        setIsFormOpen(true);
    };

    const closeForm = () => setIsFormOpen(false);

    if (isLoading) return <Spinner size="md" />;

    return (
        <>
            <div className={styles.list}>
                {tags.map((tag) => (
                    <TagItem
                        key={tag.id}
                        tag={tag}
                        onEdit={openEdit}
                        onDelete={(item) => remove(item.id)}
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
        </>
    );
}
