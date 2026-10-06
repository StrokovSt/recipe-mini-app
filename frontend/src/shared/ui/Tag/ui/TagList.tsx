import clsx from 'clsx';

import { Tag } from '@recipe/common';

import TagComponent from './TagComponent';

import styles from './TagList.module.scss';

interface TagListProps {
    tags: Tag[];
    maxVisible?: number;
    className?: string;
}

const TagList = (props: TagListProps) => {
    const { tags, maxVisible = tags.length, className } = props;

    if (tags.length === 0) return null;

    const visibleTags = tags.slice(0, maxVisible);
    const hiddenCount = tags.length - visibleTags.length;

    return (
        <div className={clsx(styles.list, className)}>
            {visibleTags.map((tag) => (
                <TagComponent key={tag.id} tag={tag} />
            ))}
            {hiddenCount > 0 && (
                <span className={styles.more}>+{hiddenCount}</span>
            )}
        </div>
    );
};

export default TagList;
