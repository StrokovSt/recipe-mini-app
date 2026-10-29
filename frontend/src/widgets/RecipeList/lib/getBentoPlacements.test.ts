import { describe, expect, it } from 'vitest';

import { type BentoPlacement, getBentoPlacements } from './getBentoPlacements';

// Занятые клетки сетки «строка:колонка» по месту карточки
const getCells = (placement: BentoPlacement) => {
    const [columnStart, columnSpan] = placement.column!.split(' / span ').map(Number);
    const [rowStart, rowSpan] = placement.row!.split(' / span ').map(Number);
    const cells: string[] = [];

    for (let row = rowStart; row < rowStart + (rowSpan || 1); row++) {
        for (let column = columnStart; column < columnStart + (columnSpan || 1); column++) {
            cells.push(`${row}:${column}`);
        }
    }

    return cells;
};

describe('getBentoPlacements', () => {
    it('на 4 колонки повторяет концепт: широкая, высокая, малые, затем зеркальный блок', () => {
        const layouts = getBentoPlacements(12, 4).map(({ layout }) => layout);

        expect(layouts).toEqual([
            'wide', 'small', 'small', 'tall', 'small', 'small',
            'small', 'small', 'tall', 'wide', 'small', 'small',
        ]);
    });

    it.each([4, 5, 6, 7, 8])('на %i колонок полосы заполнены целиком и без наложений', (columns) => {
        const placements = getBentoPlacements(60, columns).filter(({ column }) => column);
        const cells = placements.flatMap(getCells);
        const rows = Math.max(...cells.map((cell) => Number(cell.split(':')[0])));

        expect(new Set(cells).size).toBe(cells.length);
        expect(cells.length).toBe(rows * columns);
    });

    it('две высокие карточки не стоят рядом в одной полосе', () => {
        const talls = getBentoPlacements(60, 7)
            .filter(({ layout }) => layout === 'tall')
            .map(({ column, row }) => `${row}:${column}`);

        talls.forEach((tall) => {
            const [row, column] = tall.split(':');
            expect(talls).not.toContain(`${row}:${Number(column) + 1}`);
        });
    });

    it('хвост без высоких: широкая и малые, без мест в сетке', () => {
        expect(getBentoPlacements(3, 7)).toEqual([{ layout: 'wide' }, { layout: 'small' }, { layout: 'small' }]);
        expect(getBentoPlacements(2, 4)).toEqual([{ layout: 'small' }, { layout: 'small' }]);
    });

    it('хвост без широкой, если малые ровно заполняют строку', () => {
        expect(getBentoPlacements(5, 5).every(({ layout }) => layout === 'small')).toBe(true);
        expect(getBentoPlacements(3, 4)[0].layout).toBe('wide');
    });
});
