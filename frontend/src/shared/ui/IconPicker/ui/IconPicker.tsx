import clsx from 'clsx';
import { AnimatePresence, motion } from 'motion/react';
import type { FC, SVGProps } from 'react';
import { useTranslation } from 'react-i18next';

import { TRANSITION_BASE } from '@/shared/config/animation';

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

const COLLAPSED = { height: 0, opacity: 0 };
const EXPANDED = { height: 'auto', opacity: 1 };

const IconPicker = (props: IconPickerProps) => {
    const { options, value, isOpen, onChange, className } = props;
    const { t } = useTranslation();

    return (
        <AnimatePresence initial={false}>
            {isOpen && (
                <motion.div
                    className={clsx(styles.collapse, className)}
                    initial={COLLAPSED}
                    animate={EXPANDED}
                    exit={COLLAPSED}
                    transition={TRANSITION_BASE}
                >
                    <div className={styles.picker} role="radiogroup" aria-label={t('iconPicker')}>
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
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default IconPicker;
