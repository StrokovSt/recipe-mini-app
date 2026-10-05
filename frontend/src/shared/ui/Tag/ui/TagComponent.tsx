import clsx from 'clsx';
import React from 'react';

import { Tag } from '@recipe/common';

import styles from './TagComponent.module.scss'

interface BaseTagProps {
    tag: Tag;
    className?: string;
    tagIsActive?: boolean;
    clickHandler?: (tagName: string) => void;
}

const TagComponent = (props: BaseTagProps) => {
    const { tag, tagIsActive = false, className, clickHandler } = props;

    const classNames = clsx(styles.tag, className, {
        [styles['tag--isActive']]: tagIsActive,
        [styles['tag--interactive']]: Boolean(clickHandler),
    });

    const label = `#${tag.name}`;

    if (clickHandler) {
        return (
            <button
                type="button"
                className={classNames}
                aria-pressed={tagIsActive}
                onClick={() => clickHandler(tag.id)}
            >
                {label}
            </button>
        );
    }

    return <span className={classNames}>{label}</span>;
};

export default TagComponent;