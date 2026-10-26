import { useSyncExternalStore } from "react";

import { addQuery } from "../lib/addQuery";

// История поиска на главной. Пока на устройстве, позже можно перенести в /api/me
const STORAGE_KEY = "searchHistory";

function readHistory(): string[] {
    try {
        const saved: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");

        return Array.isArray(saved) ? saved.filter((item): item is string => typeof item === "string") : [];
    } catch {
        return [];
    }
}

let history = readHistory();
const listeners = new Set<() => void>();

function setHistory(next: string[]) {
    if (next === history) return;
    history = next;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    listeners.forEach((listener) => listener());
}

const subscribe = (listener: () => void) => {
    listeners.add(listener);
    return () => {
        listeners.delete(listener);
    };
};

export const useSearchHistory = () => useSyncExternalStore(subscribe, () => history);

// Запрос попадает в историю, только когда он «сработал»: нажали Enter или открыли рецепт из результатов
export const addToSearchHistory = (query: string) => setHistory(addQuery(history, query));

export const removeFromSearchHistory = (query: string) => setHistory(history.filter((item) => item !== query));

export const clearSearchHistory = () => setHistory([]);
