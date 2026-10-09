import { memo } from 'react';

import type { Category } from '@recipe/common';

import { IconButton } from '@/shared/ui/Buttons';

import { getCategoryIcon } from '../../config/categoryIcons';

import styles from './CategoryItem.module.scss';

interface CategoryItemProps {
    category: Category;
    onEdit: (category: Category) => void;
    onDelete: (category: Category) => void;
}

const CategoryItem = (props: CategoryItemProps) => {
    const { category, onEdit, onDelete } = props;
    const Icon = getCategoryIcon(category.iconName);

    return (
        <article className={styles.item}>
            <Icon className={styles.icon} aria-hidden />
            <div className={styles.actions}>
                <IconButton
                    icon="edit"
                    variant="empty"
                    className={styles.edit}
                    onClick={() => onEdit(category)}
                    aria-label={`Редактировать категорию «${category.name}»`}
                />
                <IconButton
                    icon="delete"
                    variant="empty"
                    className={styles.delete}
                    onClick={() => onDelete(category)}
                    aria-label={`Удалить категорию «${category.name}»`}
                />
            </div>
            <h3 className={styles.name}>{category.name}</h3>
        </article>
    );
};

export default memo(CategoryItem);
