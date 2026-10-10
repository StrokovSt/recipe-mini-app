import { useState } from "react";

import type { Category } from "@recipe/common";

import { buildRoute } from "@/app/router/routes";
import { CategoryItem, useCategories, useDeleteCategory } from "@/entities/category";
import { CategoryForm } from "@/features/category-form";
import { BottomSheet } from "@/shared/ui/BottomSheet";
import { AddTile } from "@/shared/ui/Buttons";
import { ConfirmModal } from "@/shared/ui/Modal";
import { Spinner } from "@/shared/ui/Spinner";

import styles from "./CategoriesTab.module.scss";

const CategoriesTab = () => {
    const { data: categories = [], isLoading } = useCategories();
    const { mutate: remove } = useDeleteCategory();

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);

    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);

    const openCreate = () => {
        setEditingCategory(null);
        setIsFormOpen(true);
    };

    const openEdit = (category: Category) => {
        setEditingCategory(category);
        setIsFormOpen(true);
    };

    const closeForm = () => setIsFormOpen(false);

    const askDelete = (category: Category) => {
        setDeletingCategory(category);
        setIsConfirmOpen(true);
    };

    const closeConfirm = () => setIsConfirmOpen(false);

    const confirmDelete = () => {
        if (deletingCategory) remove(deletingCategory.id);
        closeConfirm();
    };

    if (isLoading) return <Spinner size="md" />;

    return (
        <>
            <div className={styles.list}>
                {categories.map((category) => (
                    <CategoryItem
                        key={category.id}
                        category={category}
                        to={buildRoute.homeByCategory(category.id)}
                        onEdit={openEdit}
                        onDelete={askDelete}
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

            <ConfirmModal
                isOpen={isConfirmOpen}
                onClose={closeConfirm}
                onConfirm={confirmDelete}
                title={`Удалить категорию «${deletingCategory?.name}»?`}
                text="Рецепты из неё останутся, но без категории."
            />
        </>
    );
};

export default CategoriesTab;
