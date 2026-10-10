import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import type { Tag } from '@recipe/common';

import DeleteIcon from '@/shared/assets/icons/icon-delete.svg?react';
import EditIcon from '@/shared/assets/icons/icon-edit.svg?react';
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
    const { t } = useTranslation(['sections', 'common']);
    const recipeCount = tag.recipeCount ?? 0;

    return (
        <Tile
            icon={<span className={styles.hash}>#</span>}
            title={tag.name}
            subtitle={
                recipeCount === 0
                    ? t('tags.unused')
                    : t('recipeCount', { count: recipeCount })
            }
            to={to}
            menuLabel={t('tags.actions', { name: tag.name })}
            menu={[
                { label: t('common:edit'), icon: <EditIcon />, onClick: () => onEdit(tag) },
                { label: t('common:delete'), icon: <DeleteIcon />, danger: true, onClick: () => onDelete(tag) },
            ]}
        />
    );
};

export default memo(TagItem);
