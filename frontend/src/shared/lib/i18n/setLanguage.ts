import i18next from "i18next";

import type { Language } from "@/shared/config/i18n";

import { loadDictionaries } from "./loadDictionaries";

export const LANGUAGE_STORAGE_KEY = "language";

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
