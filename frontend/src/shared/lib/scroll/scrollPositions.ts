// Прокрутка страниц по записям истории: после «Назад» страница открывается там, где её оставили.
// Ключ — location.key: у каждой записи свой, новая страница начинается сверху
const positions = new Map<string, number>();

export const saveScroll = (key: string, top: number) => {
    positions.set(key, top);
};

export const getSavedScroll = (key: string) => positions.get(key) ?? 0;
