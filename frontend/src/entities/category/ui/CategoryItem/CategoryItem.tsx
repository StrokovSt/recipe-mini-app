import clsx from 'clsx';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import type { Category } from '@recipe/common';

import DeleteIcon from '@/shared/assets/icons/icon-delete.svg?react';
import EditIcon from '@/shared/assets/icons/icon-edit.svg?react';
import { Tile } from '@/shared/ui/Tile';

import { getCategoryIcon, getCategoryIconName } from '../../config/categoryIcons';

import styles from './CategoryItem.module.scss';

interface CategoryItemProps {
    category: Category;
    // Куда ведёт плитка
    to: string;
    onEdit: (category: Category) => void;
    onDelete: (category: Category) => void;
}

const CategoryItem = (props: CategoryItemProps) => {
    const { category, to, onEdit, onDelete } = props;
    const { t } = useTranslation(['sections', 'common']);
    const Icon = getCategoryIcon(category.iconName);
    // Цвет плитки под картинку: класс с ключом картинки (CategoryItem.module.scss)
    const theme = getCategoryIconName(category.iconName).toLowerCase();
    const count = category.recipeCount;

    // Без счётчика с бэка подпись не показываем
    const subtitle = count === undefined
        ? undefined
        : count === 0 ? t('categories.noRecipes') : t('recipeCount', { count });

    return (
        <Tile
            className={clsx(styles.tile, styles[theme])}
            icon={<Icon />}
            title={category.name}
            subtitle={subtitle}
            to={to}
            menuLabel={t('categories.actions', { name: category.name })}
            menu={[
                { label: t('common:edit'), icon: <EditIcon />, onClick: () => onEdit(category) },
                // Резервную категорию «Разное» удалить нельзя
                ...(category.isDefault ? [] : [
                    { label: t('common:delete'), icon: <DeleteIcon />, danger: true, onClick: () => onDelete(category) },
                ]),
            ]}
        />
    );
};

export default memo(CategoryItem);
