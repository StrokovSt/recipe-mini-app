import clsx from 'clsx';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

import styles from './CategoryComponent.module.scss';

interface CategoryComponentProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    label: string;
    icon?: ReactNode;
    isActive?: boolean;
}

const CategoryComponent = (props: CategoryComponentProps) => {
    const { label, icon, isActive = false, className, ...rest } = props;

    return (
        <button
            type="button"
            className={clsx(styles.category, isActive && styles['category--isActive'], className)}
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
