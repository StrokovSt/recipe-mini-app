// Живая сетка на компьютере. Карточки идут полосами по две строки, полоса во всю ширину сетки
// и собрана из кусков:
// pair — широкая карточка, под ней две малые (2 колонки);
// tall — высокая карточка на обе строки (1 колонка);
// stack — две малые одна над другой (1 колонка).
// Чётные полосы начинаются с pair, нечётные зеркально — со stack. Две высокие рядом не встают.
// Карточки, которым не хватило на целую полосу, идут строками без высоких: широкая и малые.
// Без широкой, если одни малые ровно заполняют строки, а с ней последняя строка неполная
export type BentoLayout = 'small' | 'wide' | 'tall';

export interface BentoPlacement {
    layout: BentoLayout;
    // Место в сетке (grid-column, grid-row). У хвоста его нет: карточки встают по порядку после полос
    column?: string;
    row?: string;
}

type Piece = 'pair' | 'tall' | 'stack';

const PIECE_WIDTH: Record<Piece, number> = { pair: 2, tall: 1, stack: 1 };
const PIECE_CARDS: Record<Piece, number> = { pair: 3, tall: 1, stack: 2 };
const ORDER: Piece[] = ['pair', 'tall', 'stack'];
const MIRRORED: Piece[] = ['stack', 'tall', 'pair'];
// С какого числа карточек хвост начинается с широкой
const TAIL_WIDE_MIN = 3;

// Куски одной полосы: по кругу из ORDER (или MIRRORED), пока не заполнится ширина.
// Не влезает pair — ставим кусок в одну колонку, после высокой всегда stack
const getBandPieces = (band: number, columns: number): Piece[] => {
    const order = band % 2 === 0 ? ORDER : MIRRORED;
    const pieces: Piece[] = [];
    let width = 0;

    for (let index = 0; width < columns; index++) {
        const previous = pieces[pieces.length - 1];
        let piece = order[index % order.length];
        if (width + PIECE_WIDTH[piece] > columns) piece = previous === 'tall' ? 'stack' : 'tall';
        if (piece === 'tall' && previous === 'tall') piece = 'stack';

        pieces.push(piece);
        width += PIECE_WIDTH[piece];
    }

    return pieces;
};

// Карточки куска на своих местах: колонка column, верхняя строка полосы row (обе с 1)
const placePiece = (piece: Piece, column: number, row: number): BentoPlacement[] => {
    switch (piece) {
        case 'pair':
            return [
                { layout: 'wide', column: `${column} / span 2`, row: `${row}` },
                { layout: 'small', column: `${column}`, row: `${row + 1}` },
                { layout: 'small', column: `${column + 1}`, row: `${row + 1}` },
            ];
        case 'tall':
            return [{ layout: 'tall', column: `${column}`, row: `${row} / span 2` }];
        case 'stack':
            return [
                { layout: 'small', column: `${column}`, row: `${row}` },
                { layout: 'small', column: `${column}`, row: `${row + 1}` },
            ];
    }
};

export const getBentoPlacements = (count: number, columns: number): BentoPlacement[] => {
    const placements: BentoPlacement[] = [];

    for (let band = 0; ; band++) {
        const pieces = getBandPieces(band, columns);
        const cards = pieces.reduce((sum, piece) => sum + PIECE_CARDS[piece], 0);
        if (placements.length + cards > count) break;

        let column = 1;
        pieces.forEach((piece) => {
            placements.push(...placePiece(piece, column, band * 2 + 1));
            column += PIECE_WIDTH[piece];
        });
    }

    const tailStart = placements.length;
    const tail = count - tailStart;
    const isEvenWithoutWide = tail % columns === 0 && (tail + 1) % columns !== 0;
    const hasWide = tail >= TAIL_WIDE_MIN && !isEvenWithoutWide;

    for (let index = tailStart; index < count; index++) {
        const isWide = hasWide && index === tailStart;
        placements.push({ layout: isWide ? 'wide' : 'small' });
    }

    return placements;
};
