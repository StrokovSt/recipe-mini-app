import { normalizeSearch } from "@recipe/common";

// Сколько последних запросов помнит история
export const SEARCH_HISTORY_LIMIT = 8;

// Запрос встаёт первым. Тот же запрос (без учёта регистра и ё) не повторяется, а поднимается наверх.
// История пишется по ходу набора, поэтому обрывки сливаются: «бор» заменяется на «борщ»,
// а если стёрли буквы («борщ» → «бор»), короткий вариант не сохраняется
export function addQuery(history: string[], query: string): string[] {
    const trimmed = query.replace(/\s+/g, " ").trim();

    if (!trimmed) return history;

    const key = normalizeSearch(trimmed);
    const [last, ...rest] = history;

    if (last !== undefined) {
        const lastKey = normalizeSearch(last);

        if (lastKey !== key && lastKey.startsWith(key)) return history;
        if (key.startsWith(lastKey)) return [trimmed, ...rest];
    }

    return [trimmed, ...history.filter((item) => normalizeSearch(item) !== key)].slice(0, SEARCH_HISTORY_LIMIT);
}
