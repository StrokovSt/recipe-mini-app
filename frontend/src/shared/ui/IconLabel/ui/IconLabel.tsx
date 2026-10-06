import clsx from 'clsx';
import type { ReactNode } from 'react';

import styles from './IconLabel.module.scss';

interface IconLabelProps {
    icon: ReactNode;
    children: ReactNode;
    className?: string;
}

const IconLabel = (props: IconLabelProps) => {
    const { icon, children, className } = props;

    return (
        <span className={clsx(styles.label, className)}>
            {icon}
            {children}
        </span>
    );
};

export default IconLabel;
