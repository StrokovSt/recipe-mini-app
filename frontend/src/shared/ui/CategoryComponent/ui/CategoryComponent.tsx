import clsx from 'clsx';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

import styles from './CategoryComponent.module.scss';

interface CategoryComponentProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    label: string;
    icon?: ReactNode;
    isActive?: boolean;
    // Ключ цветов плитки категории (category-colors.scss): без него плитка нейтральная
    colorKey?: string;
}

const CategoryComponent = (props: CategoryComponentProps) => {
    const { label, icon, isActive = false, colorKey, className, ...rest } = props;

    return (
        <button
            type="button"
            className={clsx(styles.category, colorKey && styles[colorKey], isActive && styles['category--isActive'], className)}
            aria-pressed={isActive}
            title={label}
            {...rest}
        >
            {icon}
            <span className={styles.label}>{label}</span>
        </button>
    );
};

export default CategoryComponent;
