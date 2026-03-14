import clsx from "clsx";

import { useTags } from "@/entities/tag";

import styles from "./TagsSelect.module.scss";

interface TagsSelectProps {
    value: string[];
    onChange: (ids: string[]) => void;
}

const TagsSelect = ({ value, onChange }: TagsSelectProps) => {
    const { data: tags = [] } = useTags();

    const toggle = (id: string) => {
        onChange(value.includes(id) ? value.filter((v) => v !== id) : [...value, id]);
    };

    return (
        <div className={styles.wrap}>
            {tags.map((tag) => (
                <button
                    key={tag.id}
                    type="button"
                    onClick={() => toggle(tag.id)}
                    className={clsx(styles.tag, value.includes(tag.id) && styles.tagActive)}
                >
                    {tag.name}
                </button>
            ))}
        </div>
    );
};

export default TagsSelect;