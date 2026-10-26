export interface WithId {
    id: string;
}

// Reorder из motion отдаёт новый порядок целиком: находим в нём сдвинутый элемент, откуда и куда он встал.
// В форме двигаем только его, так у строк остаются прежние id и поля не пересоздаются
export const findMove = (prev: WithId[], next: WithId[]): [from: number, to: number] | null => {
    const from = prev.findIndex((item, index) => item.id !== next[index].id);
    if (from === -1) return null;

    let to = prev.length - 1;
    while (to > from && prev[to].id === next[to].id) to--;

    return next[from].id === prev[to].id ? [to, from] : [from, to];
};

// Стрелки вверх и вниз на ручке: куда сдвинуть элемент списка из count штук; некуда — undefined
export const getArrowMove = (key: string, index: number, count: number) => {
    const to = { ArrowUp: index - 1, ArrowDown: index + 1 }[key];
    return to !== undefined && to >= 0 && to < count ? to : undefined;
};
