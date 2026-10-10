import type { ResourceLanguage } from "i18next";

import type { Language } from "@/shared/config/i18n";

// Каждый словарь Vite кладёт в отдельный файл сборки с хешем в имени,
// поэтому скачиваются только словари выбранного языка, а после деплоя не берутся старые из кеша
const DICTIONARIES = import.meta.glob<ResourceLanguage>("@/shared/config/i18n/locales/*/*.json", { import: "default" });

// Все словари языка: { common: {...}, settings: {...} }
export async function loadDictionaries(language: Language): Promise<Record<string, ResourceLanguage>> {
    const files = Object.entries(DICTIONARIES).filter(([path]) => path.includes(`/locales/${language}/`));
    const loaded = await Promise.all(
        files.map(async ([path, load]) => [path.slice(path.lastIndexOf("/") + 1, -".json".length), await load()] as const),
    );

    return Object.fromEntries(loaded);
}
