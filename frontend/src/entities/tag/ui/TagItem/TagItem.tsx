import { memo } from 'react';

import { Tag } from '@recipe/common';

import { IconButton } from '@/shared/ui/Buttons';

import styles from './TagItem.module.scss';

interface TagItemProps {
    tag: Tag;
    onEdit: (tag: Tag) => void;
    onDelete: (tag: Tag) => void;
}

const TagItem = (props: TagItemProps) => {
    const { tag, onEdit, onDelete } = props;

    return (
        <article className={styles.item}>
            <span className={styles.hash} aria-hidden>#</span>
            <div className={styles.actions}>
                <IconButton
                    icon="edit"
                    variant="empty"
                    className={styles.edit}
                    onClick={() => onEdit(tag)}
                    aria-label={`Редактировать тег «${tag.name}»`}
                />
                <IconButton
                    icon="delete"
                    variant="empty"
                    className={styles.delete}
                    onClick={() => onDelete(tag)}
                    aria-label={`Удалить тег «${tag.name}»`}
                />
            </div>
            <h3 className={styles.name}>{tag.name}</h3>
        </article>
    );
};

export default memo(TagItem);
