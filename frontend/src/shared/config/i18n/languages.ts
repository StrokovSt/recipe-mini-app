// Языки интерфейса: код, название на самом языке и по-английски
export const LANGUAGES = [
    { code: "ru", nativeName: "Русский", englishName: "Russian" },
    { code: "en", nativeName: "English", englishName: "English" },
    { code: "uk", nativeName: "Українська", englishName: "Ukrainian" },
    { code: "de", nativeName: "Deutsch", englishName: "German" },
    { code: "fr", nativeName: "Français", englishName: "French" },
    { code: "es", nativeName: "Español", englishName: "Spanish" },
    { code: "it", nativeName: "Italiano", englishName: "Italian" },
    { code: "pt", nativeName: "Português", englishName: "Portuguese" },
    { code: "tr", nativeName: "Türkçe", englishName: "Turkish" },
    { code: "id", nativeName: "Bahasa Indonesia", englishName: "Indonesian" },
    { code: "ja", nativeName: "日本語", englishName: "Japanese" },
    { code: "zh", nativeName: "简体中文", englishName: "Chinese (Simplified)" },
    { code: "ko", nativeName: "한국어", englishName: "Korean" },
] as const;

export type Language = (typeof LANGUAGES)[number]["code"];

// Если ни сохранённый выбор, ни Телеграм, ни браузер не дали поддерживаемый язык
export const FALLBACK_LANGUAGE: Language = "en";
