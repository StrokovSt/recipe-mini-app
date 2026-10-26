// Одно уведомление на всё приложение: новое заменяет прежнее и само уходит через TOAST_MS
// Справа от текста: ссылка (например, «Открыть» черновик) или кнопка (например, «Вернуть» удалённый шаг)
export type ToastAction = { label: string } & ({ to: string; state?: unknown } | { onClick: () => void });

export interface ToastData {
    id: number;
    text: string;
    action?: ToastAction;
    // Только на этой странице: действие относится к ней (форма), на другой странице уведомление не видно
    path?: string;
}

const TOAST_MS = 6000;

const listeners = new Set<() => void>();
let toast: ToastData | null = null;
let nextId = 1;
let hideTimer: ReturnType<typeof setTimeout> | undefined;

const notify = () => listeners.forEach((listener) => listener());

export function hideToast() {
    clearTimeout(hideTimer);
    toast = null;
    notify();
}

export function showToast(data: Omit<ToastData, "id">) {
    clearTimeout(hideTimer);
    toast = { ...data, id: nextId++ };
    notify();
    hideTimer = setTimeout(hideToast, TOAST_MS);
}

export function subscribeToast(listener: () => void) {
    listeners.add(listener);
    return () => {
        listeners.delete(listener);
    };
}

export const getToast = () => toast;
