import type { HTMLAttributes } from 'react';
import { useTranslation } from 'react-i18next';

import FilterIcon from '@/shared/assets/icons/icon-filter.svg?react';
import { IconButton } from '@/shared/ui/Buttons';

import styles from './FilterButton.module.scss';

// Остальные атрибуты (data-*) уходят на обёртку кнопки со счётчиком
interface FilterButtonProps extends HTMLAttributes<HTMLDivElement> {
    activeCount: number;
    onClick: () => void;
    round?: boolean;
    // Подпись «Фильтры» рядом с иконкой (поиск в шапке на компьютере)
    withLabel?: boolean;
    className?: string;
    disabled?: boolean;
}

// Кнопка открытия фильтров со счётчиком включённых фильтров
export const FilterButton = (props: FilterButtonProps) => {
    const { activeCount, onClick, round, withLabel, className, disabled, ...rest } = props;
    const { t } = useTranslation('filters');

    return (
        <div className={styles.trigger} {...rest}>
            <IconButton
                round={round}
                className={className}
                aria-pressed={activeCount > 0}
                onClick={onClick}
                disabled={disabled}
                aria-label={t('open')}
            >
                <FilterIcon aria-hidden />
                {withLabel && <span className={styles.label}>{t('title')}</span>}
            </IconButton>
            {activeCount > 0 && <span className={styles.badge}>{activeCount}</span>}
        </div>
    );
};
