import { useTags } from "@/entities/tag";
import { ExpandableList } from "@/shared/ui/ExpandableList";
import { TagComponent } from "@/shared/ui/Tag";

import { COLLAPSED_ROWS } from "../../model/constants";

import styles from "./TagsSelect.module.scss";

interface TagsSelectProps {
    value: string[];
    onChange: (ids: string[]) => void;
}

// Теги как в шторке фильтров: два ряда, выбранные закреплены
const TagsSelect = ({ value, onChange }: TagsSelectProps) => {
    const { data: tags = [] } = useTags();

    const toggle = (id: string) => {
        onChange(value.includes(id) ? value.filter((v) => v !== id) : [...value, id]);
    };

    return (
        <ExpandableList
            items={tags}
            rows={COLLAPSED_ROWS}
            isPinned={(tag) => value.includes(tag.id)}
            className={styles.list}
            renderItem={(tag) => (
                <TagComponent
                    key={tag.id}
                    tag={tag}
                    clickHandler={toggle}
                    tagIsActive={value.includes(tag.id)}
                />
            )}
        />
    );
};

export default TagsSelect;
