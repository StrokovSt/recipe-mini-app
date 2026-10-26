import { normalizeSearch } from "@recipe/common";

// Что показать в списке под поиском: пустое поле — вся история, при наборе — запросы, где есть набранное
// (сам набранный запрос не повторяем)
export function matchHistory(history: string[], query: string): string[] {
    const key = normalizeSearch(query);

    if (!key) return history;

    return history.filter((item) => {
        const itemKey = normalizeSearch(item);

        return itemKey !== key && itemKey.includes(key);
    });
}
