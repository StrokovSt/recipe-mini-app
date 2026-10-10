import i18next from "i18next";
import { initReactI18next } from "react-i18next";

import { detectLanguage } from "./detectLanguage";
import { loadDictionaries } from "./loadDictionaries";

// Определяет язык и скачивает его словари. Приложение рендерится после этого, чтобы не мигали ключи
export async function initI18n() {
    const language = detectLanguage();

    await i18next.use(initReactI18next).init({
        lng: language,
        fallbackLng: false,
        defaultNS: "common",
        resources: { [language]: await loadDictionaries(language) },
        // Остальные языки догружаются в setLanguage
        partialBundledLanguages: true,
        // React сам экранирует текст
        interpolation: { escapeValue: false },
    });

    document.documentElement.setAttribute("lang", language);
}
