import { memo } from 'react';

import type { Tag } from '@recipe/common';

import DeleteIcon from '@/shared/assets/icons/icon-delete.svg?react';
import EditIcon from '@/shared/assets/icons/icon-edit.svg?react';
import { pluralize } from '@/shared/lib/plural';
import { Tile } from '@/shared/ui/Tile';

import styles from './TagItem.module.scss';

interface TagItemProps {
    tag: Tag;
    // Куда ведёт плитка
    to: string;
    onEdit: (tag: Tag) => void;
    onDelete: (tag: Tag) => void;
}

const TagItem = (props: TagItemProps) => {
    const { tag, to, onEdit, onDelete } = props;
    const recipeCount = tag.recipeCount ?? 0;

    return (
        <Tile
            icon={<span className={styles.hash}>#</span>}
            title={tag.name}
            subtitle={
                recipeCount === 0
                    ? 'Пока не используется'
                    : `${recipeCount} ${pluralize(recipeCount, ['рецепт', 'рецепта', 'рецептов'])}`
            }
            to={to}
            menuLabel={`Действия с тегом «${tag.name}»`}
            menu={[
                { label: 'Изменить', icon: <EditIcon />, onClick: () => onEdit(tag) },
                { label: 'Удалить', icon: <DeleteIcon />, danger: true, onClick: () => onDelete(tag) },
            ]}
        />
    );
};

export default memo(TagItem);
