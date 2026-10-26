import { type RefObject, useState } from "react";

import { findMove, type WithId } from "./reorder";

// Пока ничего не тянут и не двигают, раскладка меняется без анимации: иначе при добавлении и удалении
// motion плавно двигал бы строки и в этом списке, и в соседних
const INSTANT_LAYOUT = { layout: { duration: 0 } };

// Перестановка списка формы через Reorder из motion: элемент тянут за ручку или двигают стрелками и меню.
// В форме двигается только сдвинутый элемент (findMove), так поля не пересоздаются. Пока элемент тянут
// или он едет на новое место, он приподнят, а соседи плавно уступают ему место. listRef — сам список:
// за его рамки элемент не вытащить
export const useReorderList = <T extends WithId>(
    fields: T[],
    move: (from: number, to: number) => void,
    listRef: RefObject<HTMLElement | null>,
) => {
    const [draggingId, setDraggingId] = useState<string | null>(null);
    // Элемент, который переставили стрелками или из меню: до конца его анимации
    const [movingId, setMovingId] = useState<string | null>(null);
    const isReordering = draggingId !== null || movingId !== null;

    const groupProps = {
        axis: "y" as const,
        values: fields,
        onReorder: (next: T[]) => {
            const change = findMove(fields, next);
            if (change) move(...change);
        },
    };

    const getItem = (field: T, index: number) => ({
        // Для Reorder.Item: тянут только за ручку и не дальше рамок списка, у края чуть пружинит
        props: {
            value: field,
            dragListener: false,
            dragConstraints: listRef,
            dragElastic: 0.05,
            transition: isReordering ? undefined : INSTANT_LAYOUT,
            onDragStart: () => setDraggingId(field.id),
            onDragEnd: () => setDraggingId(null),
            onLayoutAnimationComplete: () => setMovingId(null),
        },
        isLifted: draggingId === field.id || movingId === field.id,
        // Переставить на место to так же плавно, как при перетаскивании
        move: (to: number) => {
            setMovingId(field.id);
            move(index, to);
        },
    });

    return { groupProps, getItem };
};

export type ReorderItem = ReturnType<ReturnType<typeof useReorderList>["getItem"]>;
