import { useState } from "react";

import { useCategories, useCreateCategory, useDeleteCategory, useRenameCategory } from "@/entities/category";
import { Spinner } from "@/shared/ui/Spinner";

import { EditableItem } from "../EditableItem/EditableItem";

import styles from "./CategoriesTab.module.scss";

const CategoriesTab = () => {
    const { data: categories = [], isLoading } = useCategories();
    const { mutate: rename } = useRenameCategory();
    const { mutate: remove } = useDeleteCategory();
    const { mutate: create } = useCreateCategory();

    const [newCategory, setNewCategory] = useState("");

    const handleCreate = () => {
        const trimmed = newCategory.trim();
        if (!trimmed) return;
        create(trimmed, { onSuccess: () => setNewCategory("") });
    };

    if (isLoading) return <Spinner size="md" />;

    return (
        <div className={styles.wrap}>
            <div className={styles.createRow}>
                <input
                    className={styles.input}
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="Новая категория..."
                    onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                />
                <button
                    className={styles.addBtn}
                    onClick={handleCreate}
                    disabled={!newCategory.trim()}
                >
                    +
                </button>
            </div>

            {categories.length === 0 ? (
                <p className={styles.empty}>Категорий пока нет</p>
            ) : (
                <div className={styles.list}>
                    {categories.map((cat) => (
                        <EditableItem
                            key={cat.id}
                            name={cat.name}
                            onRename={(newName) => rename({ id: cat.id, name: newName })}
                            onDelete={() => remove(cat.id)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default CategoriesTab;