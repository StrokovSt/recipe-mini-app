// localStorage бывает недоступен: запрещены данные сайтов, старый Safari в приватном режиме, хранилище переполнено.
// Тогда любое обращение к нему бросает исключение. Здесь оно гасится: приложение запускается, просто без сохранённых настроек
export const storage = {
    get(key: string): string | null {
        try {
            return localStorage.getItem(key);
        } catch {
            return null;
        }
    },
    set(key: string, value: string) {
        try {
            localStorage.setItem(key, value);
        } catch {
            // Не сохранилось: выбор действует до перезагрузки
        }
    },
};
