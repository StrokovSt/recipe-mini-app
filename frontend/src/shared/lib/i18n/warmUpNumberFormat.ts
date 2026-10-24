import i18next from "i18next";

// Первое форматирование числа на языке дорогое: браузер готовит данные локали (~50 мс на слабом телефоне).
// Делаем его в простое после показа первой страницы, чтобы не тормозило первое открытие рецепта
export function warmUpNumberFormat() {
    const run = () => new Intl.NumberFormat(i18next.language).format(1.5);

    if ("requestIdleCallback" in window) requestIdleCallback(run);
    else setTimeout(run, 1000);
}
