import { IconButton } from '@/shared/ui/Buttons';

import styles from './FilterButton.module.scss';

interface FilterButtonProps {
    activeCount: number;
    onClick: () => void;
    round?: boolean;
    className?: string;
}

// Кнопка открытия фильтров со счётчиком включённых фильтров
export const FilterButton = (props: FilterButtonProps) => {
    const { activeCount, onClick, round, className } = props;

    return (
        <div className={styles.trigger}>
            <IconButton
                icon="filter"
                round={round}
                className={className}
                aria-pressed={activeCount > 0}
                onClick={onClick}
                aria-label="Открыть фильтры"
            />
            {activeCount > 0 && <span className={styles.badge}>{activeCount}</span>}
        </div>
    );
};
