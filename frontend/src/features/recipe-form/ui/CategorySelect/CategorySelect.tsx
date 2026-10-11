import { getCategoryIcon, useCategories } from "@/entities/category";
import { CategoryComponent } from "@/shared/ui/CategoryComponent";
import { ExpandableList } from "@/shared/ui/ExpandableList";

import { COLLAPSED_ROWS } from "../../model/constants";

import styles from "./CategorySelect.module.scss";

interface CategorySelectProps {
    value: string | null;
    onChange: (id: string) => void;
}

// Категория обязательна: пока не выбрана, отмечена «Разное», туда рецепт и сохранится
const CategorySelect = ({ value, onChange }: CategorySelectProps) => {
    const { data: categories = [] } = useCategories();
    const selectedId = value ?? categories.find((category) => category.isDefault)?.id;

    return (
        <ExpandableList
            items={categories}
            rows={COLLAPSED_ROWS}
            isPinned={(category) => category.id === selectedId}
            className={styles.list}
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
    );
};

export default CategorySelect;
