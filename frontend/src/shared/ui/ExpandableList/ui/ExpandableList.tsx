import { animate } from 'motion/react';
import { type ReactElement, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import ChevronIcon from '@/shared/assets/icons/icon-chevron.svg?react';
import { TRANSITION_BASE } from '@/shared/config/animation';

import styles from './ExpandableList.module.scss';

interface ExpandableListProps<T> {
    items: T[];
    rows: number;
    renderItem: (item: T) => ReactElement;
    isPinned?: (item: T) => boolean;
    className?: string;
}

interface Capacity<T> {
    items: T[];
    rows: number;
    width: number;
    value: number;
}

// Анимация высоты обёртки; на время анимации обрезаем содержимое
const animateHeight = (element: HTMLElement, from: number, to: number) => {
    element.style.overflow = 'hidden';

    return animate(element, { height: [from, to] }, TRANSITION_BASE);
};

// Возвращаем обёртке высоту по содержимому
const resetHeight = (element: HTMLElement | null) => {
    if (!element) return;

    element.style.height = '';
    element.style.overflow = '';
};

// Сколько элементов помещается в первые rows рядов: ряды определяем по offsetTop детей
const countInRows = (list: HTMLElement, rows: number) => {
    const tops = Array.from(list.children, (child) => (child as HTMLElement).offsetTop);
    const rowTops = [...new Set(tops)].sort((a, b) => a - b);

    if (rowTops.length <= rows) return tops.length;

    return tops.filter((top) => top < rowTops[rows]).length;
};

export const ExpandableList = <T,>(props: ExpandableListProps<T>) => {
    const { items, rows, renderItem, isPinned, className } = props;
    const { t } = useTranslation();
    const [isExpanded, setIsExpanded] = useState(false);
    const [width, setWidth] = useState(0);
    const [measured, setMeasured] = useState<Capacity<T> | null>(null);

    const viewportRef = useRef<HTMLDivElement>(null);
    const listRef = useRef<HTMLDivElement>(null);
    const startHeightRef = useRef<number | null>(null);

    // Вместимость пересчитывается при смене элементов, числа рядов или ширины
    const isMeasured =
        measured !== null && measured.items === items && measured.rows === rows && measured.width === width;
    const capacity = isMeasured ? measured.value : items.length;

    // Выбранные элементы за пределами рядов занимают последние места, чтобы рядов осталось столько же
    const pinnedBeyond = items.filter((item, index) => index >= capacity && isPinned?.(item)).length;
    const isVisibleCollapsed = (item: T, index: number) =>
        index < capacity - pinnedBeyond || !!isPinned?.(item);

    const hiddenCount = items.filter((item, index) => !isVisibleCollapsed(item, index)).length;
    const isShowingAll = isExpanded || !isMeasured;
    const visibleItems = isShowingAll ? items : items.filter(isVisibleCollapsed);

    // Следим за шириной: от неё зависит, сколько элементов в ряду
    useEffect(() => {
        const viewport = viewportRef.current!;
        const observer = new ResizeObserver(([entry]) => setWidth(Math.round(entry.contentRect.width)));

        observer.observe(viewport);

        return () => observer.disconnect();
    }, []);

    // Замер: все элементы отрисованы, считаем сколько влезает в rows рядов (до отрисовки на экране)
    useLayoutEffect(() => {
        if (isMeasured || width === 0) return;

        setMeasured({ items, rows, width, value: countInRows(listRef.current!, rows) });
    }, [isMeasured, items, rows, width]);

    // Раскрытие: все элементы уже отрисованы, анимируем от прежней высоты до полной
    useLayoutEffect(() => {
        const from = startHeightRef.current;
        if (from === null) return;
        startHeightRef.current = null;

        const viewport = viewportRef.current!;

        if (isExpanded) {
            animateHeight(viewport, from, listRef.current!.offsetHeight).then(() => resetHeight(viewport));
        } else {
            resetHeight(viewport);
        }
    }, [isExpanded]);

    // Высота списка, если оставить только элементы свёрнутого вида
    const getCollapsedHeight = () => {
        const children = Array.from(listRef.current!.children) as HTMLElement[];

        return children.reduce(
            (height, child, index) =>
                isVisibleCollapsed(items[index], index)
                    ? Math.max(height, child.offsetTop + child.offsetHeight)
                    : height,
            0
        );
    };

    const handleToggle = () => {
        const viewport = viewportRef.current!;
        const from = viewport.offsetHeight;

        if (isExpanded) {
            // Сворачивание: сначала анимируем высоту, потом убираем лишние элементы
            animateHeight(viewport, from, getCollapsedHeight()).then(() => {
                startHeightRef.current = from;
                setIsExpanded(false);
            });
        } else {
            startHeightRef.current = from;
            setIsExpanded(true);
        }
    };

    return (
        <>
            <div ref={viewportRef} className={styles.viewport}>
                <div ref={listRef} className={className}>
                    {visibleItems.map(renderItem)}
                </div>
            </div>

            {hiddenCount > 0 && (
                <button
                    type="button"
                    className={styles.toggle}
                    aria-expanded={isExpanded}
                    onClick={handleToggle}
                >
                    {isExpanded ? t('collapse') : t('showMore', { count: hiddenCount })}
                    <ChevronIcon aria-hidden />
                </button>
            )}
        </>
    );
};
