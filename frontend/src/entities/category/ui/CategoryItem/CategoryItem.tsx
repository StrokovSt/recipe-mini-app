import { memo } from 'react';

import type { Category } from '@recipe/common';

import DeleteIcon from '@/shared/assets/icons/icon-delete.svg?react';
import EditIcon from '@/shared/assets/icons/icon-edit.svg?react';
import { pluralize } from '@/shared/lib/plural';
import { Tile } from '@/shared/ui/Tile';

import { getCategoryIcon } from '../../config/categoryIcons';

interface CategoryItemProps {
    category: Category;
    // Куда ведёт плитка
    to: string;
    onEdit: (category: Category) => void;
    onDelete: (category: Category) => void;
}

const getSubtitle = (count?: number) => {
    if (count === undefined) return undefined;
    if (count === 0) return 'Нет рецептов';

    return `${count} ${pluralize(count, ['рецепт', 'рецепта', 'рецептов'])}`;
};

const CategoryItem = (props: CategoryItemProps) => {
    const { category, to, onEdit, onDelete } = props;
    const Icon = getCategoryIcon(category.iconName);

    return (
        <Tile
            icon={<Icon />}
            title={category.name}
            subtitle={getSubtitle(category.recipeCount)}
            to={to}
            menuLabel={`Действия с категорией «${category.name}»`}
            menu={[
                { label: 'Изменить', icon: <EditIcon />, onClick: () => onEdit(category) },
                { label: 'Удалить', icon: <DeleteIcon />, danger: true, onClick: () => onDelete(category) },
            ]}
        />
    );
};

export default memo(CategoryItem);
