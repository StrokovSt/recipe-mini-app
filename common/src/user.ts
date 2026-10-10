export type Plan = "FREE" | "PRO";

export type Theme = "light" | "dark";

// Настройки интерфейса. null — пользователь не выбирал, устройство определяет само
export interface UserSettings {
    language: string | null;
    theme: Theme | null;
    animations: boolean | null;
}

// GET /api/me
export interface User extends UserSettings {
    id: string;
    plan: Plan;
    // Сколько рецептов можно создать, null — без ограничений
    recipeLimit: number | null;
    recipeCount: number;
    aiEnabled: boolean;
}

// PATCH /api/me: меняются только настройки
export type UpdateUserSettingsDto = Partial<UserSettings>;
