import { useState } from "react";
import { useTranslation } from "react-i18next";

import { CategoryForm, getCategoryIcon, useCategories } from "@/entities/category";
import { BottomSheet } from "@/shared/ui/BottomSheet";
import { AddTile } from "@/shared/ui/Buttons";
import { CategoryComponent } from "@/shared/ui/CategoryComponent";
import { ExpandableList } from "@/shared/ui/ExpandableList";

import { COLLAPSED_ROWS } from "../../model/constants";

import styles from "./CategorySelect.module.scss";

interface CategorySelectProps {
    value: string | null;
    onChange: (id: string) => void;
}

// Категория обязательна: пока не выбрана, отмечена «Разное», туда рецепт и сохранится.
// Первой идёт «+ Новая»: созданная в шторке категория сразу выбирается
const CategorySelect = ({ value, onChange }: CategorySelectProps) => {
    const { t } = useTranslation(["recipeForm", "sections"]);
    const { data: categories = [] } = useCategories();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const selectedId = value ?? categories.find((category) => category.isDefault)?.id;

    const closeForm = () => setIsFormOpen(false);

    return (
        <>
            <ExpandableList
                items={categories}
                rows={COLLAPSED_ROWS}
                isPinned={(category) => category.id === selectedId}
                className={styles.list}
                leading={
                    <AddTile
                        className={styles.add}
                        label={t("recipe.newCategory")}
                        aria-label={t("sections:categories.add")}
                        onClick={() => setIsFormOpen(true)}
                    />
                }
                renderItem={(category) => {
                    const Icon = getCategoryIcon(category.iconName);

                    return (
                        <CategoryComponent
                            key={category.id}
                            label={category.name}
                            icon={<Icon />}
                            isActive={category.id === selectedId}
                            onClick={() => onChange(category.id)}
                        />
                    );
                }}
            />

            <BottomSheet isOpen={isFormOpen} onClose={closeForm} title={t("sections:categories.add")}>
                <CategoryForm
                    onSuccess={(category) => {
                        onChange(category.id);
                        closeForm();
                    }}
                    onCancel={closeForm}
                />
            </BottomSheet>
        </>
    );
};

export default CategorySelect;
