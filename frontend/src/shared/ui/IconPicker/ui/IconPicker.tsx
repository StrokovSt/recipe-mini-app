import clsx from 'clsx';
import type { FC, SVGProps } from 'react';

import styles from './IconPicker.module.scss';

export interface IconOption {
    name: string;
    label: string;
    Icon: FC<SVGProps<SVGSVGElement>>;
}

interface IconPickerProps {
    options: IconOption[];
    value: string;
    isOpen: boolean;
    onChange: (name: string) => void;
    className?: string;
}

const IconPicker = (props: IconPickerProps) => {
    const { options, value, isOpen, onChange, className } = props;

    return (
        <div
            className={clsx(styles.picker, isOpen && styles['picker--isOpen'], className)}
            role="radiogroup"
            aria-label="Выбор иконки"
        >
            {options.map(({ name, label, Icon }) => (
                <button
                    key={name}
                    type="button"
                    role="radio"
                    aria-checked={value === name}
                    aria-label={label}
                    title={label}
                    className={styles.option}
                    onClick={() => onChange(name)}
                >
                    <Icon />
                </button>
            ))}
        </div>
    );
};

export default IconPicker;
