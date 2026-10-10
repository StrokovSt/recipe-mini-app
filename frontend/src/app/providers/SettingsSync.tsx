import { useSyncSettings } from "@/entities/user";

// Подтягивает язык, тему и анимации из профиля на сервере
export function SettingsSync() {
    useSyncSettings();
    return null;
}
