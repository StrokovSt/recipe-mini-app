// Шрифты грузятся, только когда текст ими уже нарисован, и при подмене текст перескакивает.
// Загружаем их заранее, латиницу и кириллицу
const FONTS = ["Literata Variable", "Noto Sans Variable", "Noto Serif Variable"];
const SAMPLE = "Aa Аа";

// Медленная сеть не держит запуск дольше этого: дальше шрифты догрузятся сами
const MAX_WAIT_MS = 1000;

export function loadFonts(): Promise<unknown> {
    const fonts = Promise.all(FONTS.map((font) => document.fonts.load(`1em "${font}"`, SAMPLE))).catch(() => undefined);
    const timeout = new Promise((resolve) => setTimeout(resolve, MAX_WAIT_MS));

    return Promise.race([fonts, timeout]);
}
