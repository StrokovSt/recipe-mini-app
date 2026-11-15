import { api } from "@/shared/api";
import { storage } from "@/shared/lib/storage";

// Что прошлый аккаунт оставил на устройстве: ответы и фото, сохранённые для работы без сети (кэши service worker
// из vite.config.ts), и история поиска (ключ из features/search-history)
const OFFLINE_CACHES = ["api", "photos"];
const SEARCH_HISTORY_KEY = "searchHistory";

// Следующему аккаунту на этом устройстве данные прошлого достаться не должны.
// Перезагрузка сбрасывает и память приложения: дальше страница входа или новый аккаунт
const leaveAccount = async () => {
    storage.remove(SEARCH_HISTORY_KEY);
    // Кэши бывают недоступны (запрещены данные сайтов): выйти это не мешает
    if ("caches" in window) await Promise.all(OFFLINE_CACHES.map((name) => caches.delete(name))).catch(() => undefined);
    location.assign("/");
};

// Выйти на сайте: Better Auth удаляет сессию и куки
export async function signOut() {
    await api.post("/api/auth/sign-out", {});
    await leaveAccount();
}

// Удалить аккаунт со всеми рецептами. В мини-аппе после перезагрузки появится новый пустой аккаунт
export async function deleteAccount() {
    await api.delete("/api/me");
    // Сессии удалены вместе с аккаунтом, а выход ещё и стирает куки на сайте. В мини-аппе сессии нет, ошибку не ждём
    await api.post("/api/auth/sign-out", {}).catch(() => undefined);
    await leaveAccount();
}
