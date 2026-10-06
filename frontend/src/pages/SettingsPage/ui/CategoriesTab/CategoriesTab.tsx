import { useState } from "react";

import { Category } from "@recipe/common";

import { CategoryItem, useCategories, useDeleteCategory } from "@/entities/category";
import { CategoryForm } from "@/features/category-form";
import { BottomSheet } from "@/shared/ui/BottomSheet";
import { AddTile } from "@/shared/ui/Buttons";
import { Spinner } from "@/shared/ui/Spinner";

import styles from "./CategoriesTab.module.scss";

const CategoriesTab = () => {
    const { data: categories = [], isLoading } = useCategories();
    const { mutate: remove } = useDeleteCategory();

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);

    const openCreate = () => {
        setEditingCategory(null);
        setIsFormOpen(true);
    };

    const openEdit = (category: Category) => {
        setEditingCategory(category);
        setIsFormOpen(true);
    };

    const closeForm = () => setIsFormOpen(false);

    if (isLoading) return <Spinner size="md" />;

    return (
        <>
            <div className={styles.list}>
                {categories.map((category) => (
                    <CategoryItem
                        key={category.id}
                        category={category}
                        onEdit={openEdit}
                        onDelete={(item) => remove(item.id)}
                    />
                ))}
                <AddTile label="Новая категория" onClick={openCreate} />
            </div>

            <BottomSheet
                isOpen={isFormOpen}
                onClose={closeForm}
                title={editingCategory ? "Редактирование" : "Новая категория"}
            >
                <CategoryForm
                    key={editingCategory?.id ?? "new"}
                    category={editingCategory}
                    onSuccess={closeForm}
                    onCancel={closeForm}
                />
            </BottomSheet>
        </>
    );
};

export default CategoriesTab;
