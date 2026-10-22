import { useState } from "react";
import { useTranslation } from "react-i18next";

import { TagForm, useTags } from "@/entities/tag";
import { BottomSheet } from "@/shared/ui/BottomSheet";
import { AddTile } from "@/shared/ui/Buttons";
import { ExpandableList } from "@/shared/ui/ExpandableList";
import { TagComponent } from "@/shared/ui/Tag";

import { COLLAPSED_ROWS } from "../../model/constants";

import styles from "./TagsSelect.module.scss";

interface TagsSelectProps {
    value: string[];
    onChange: (ids: string[]) => void;
}

// Теги как в шторке фильтров: два ряда, выбранные закреплены.
// Первым идёт «+ Новый»: созданный в шторке тег сразу выбирается
const TagsSelect = ({ value, onChange }: TagsSelectProps) => {
    const { t } = useTranslation(["recipeForm", "sections"]);
    const { data: tags = [] } = useTags();
    const [isFormOpen, setIsFormOpen] = useState(false);

    const toggle = (id: string) => {
        onChange(value.includes(id) ? value.filter((v) => v !== id) : [...value, id]);
    };

    const closeForm = () => setIsFormOpen(false);

    return (
        <>
            <ExpandableList
                items={tags}
                rows={COLLAPSED_ROWS}
                isPinned={(tag) => value.includes(tag.id)}
                className={styles.list}
                leading={
                    <AddTile
                        className={styles.add}
                        label={t("recipe.newTag")}
                        aria-label={t("sections:tags.add")}
                        onClick={() => setIsFormOpen(true)}
                    />
                }
                renderItem={(tag) => (
                    <TagComponent
                        key={tag.id}
                        tag={tag}
                        clickHandler={toggle}
                        tagIsActive={value.includes(tag.id)}
                    />
                )}
            />

            <BottomSheet isOpen={isFormOpen} onClose={closeForm} title={t("sections:tags.add")}>
                <TagForm
                    onSuccess={(tag) => {
                        onChange([...value, tag.id]);
                        closeForm();
                    }}
                    onCancel={closeForm}
                />
            </BottomSheet>
        </>
    );
};

export default TagsSelect;
