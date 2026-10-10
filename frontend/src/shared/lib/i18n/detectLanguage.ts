import WebApp from "@twa-dev/sdk";

import { FALLBACK_LANGUAGE, type Language, LANGUAGES } from "@/shared/config/i18n";

import { LANGUAGE_STORAGE_KEY } from "./setLanguage";

// «pt-BR» → «pt», «zh-hans» → «zh»; неподдерживаемый язык → undefined
function toLanguage(code: string | null | undefined): Language | undefined {
    const base = code?.toLowerCase().split("-")[0];

    return LANGUAGES.find((language) => language.code === base)?.code;
}

// Сохранённый выбор, иначе язык Телеграма, иначе языки браузера по порядку
export function detectLanguage(): Language {
    const candidates = [
        localStorage.getItem(LANGUAGE_STORAGE_KEY),
        WebApp.initDataUnsafe?.user?.language_code,
        ...navigator.languages,
    ];

    for (const candidate of candidates) {
        const language = toLanguage(candidate);
        if (language) return language;
    }

    return FALLBACK_LANGUAGE;
}
