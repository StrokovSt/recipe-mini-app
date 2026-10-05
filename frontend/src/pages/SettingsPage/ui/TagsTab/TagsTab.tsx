import { useState } from "react";

import { useCreateTag, useDeleteTag, useRenameTag, useTags } from "@/entities/tag";
import { Spinner } from "@/shared/ui/Spinner";

import { EditableItem } from "../EditableItem/EditableItem";

import styles from "./TagsTab.module.scss";

export function TagsTab() {
    const { data: tags = [], isLoading } = useTags();
    const { mutate: create } = useCreateTag();
    const { mutate: rename } = useRenameTag();
    const { mutate: remove } = useDeleteTag();

    const [newTag, setNewTag] = useState("");

    const handleCreate = () => {
        const trimmed = newTag.trim();
        if (!trimmed) return;
        create(trimmed, { onSuccess: () => setNewTag("") });
    };

    if (isLoading) return <Spinner size="md" />;

    return (
        <div className={styles.wrap}>
            <div className={styles.createRow}>
                <input
                    className={styles.input}
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Новый тег..."
                    onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                />
                <button
                    className={styles.addBtn}
                    onClick={handleCreate}
                    disabled={!newTag.trim()}
                >
                    +
                </button>
            </div>

            {tags.length === 0 ? (
                <p className={styles.empty}>Тегов пока нет</p>
            ) : (
                <div className={styles.list}>
                    {tags.map((tag) => (
                        <EditableItem
                            key={tag.id}
                            name={tag.name}
                            onRename={(newName) => rename({ id: tag.id, name: newName })}
                            onDelete={() => remove(tag.id)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}