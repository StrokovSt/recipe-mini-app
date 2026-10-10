import i18next from "i18next";

import { type Language, LANGUAGES } from "@/shared/config/i18n";

import { loadDictionaries } from "./loadDictionaries";

export const LANGUAGE_STORAGE_KEY = "language";

export function isLanguage(code: string | null | undefined): code is Language {
    return LANGUAGES.some((language) => language.code === code);
}

// Выбор, сохранённый на устройстве, null — язык определяется автоматически
export function getSavedLanguage(): Language | null {
    const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    return isLanguage(saved) ? saved : null;
}

// Сохраняет выбор, догружает словари языка, если их ещё нет, и переключает интерфейс без перезагрузки
export async function setLanguage(language: Language) {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, language);

    if (!i18next.hasResourceBundle(language, "common")) {
        const dictionaries = await loadDictionaries(language);

        Object.entries(dictionaries).forEach(([namespace, resources]) => {
            i18next.addResourceBundle(language, namespace, resources);
        });
    }

    await i18next.changeLanguage(language);
    document.documentElement.setAttribute("lang", language);
}
