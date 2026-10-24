// Одно уведомление на всё приложение: новое заменяет прежнее и само уходит через TOAST_MS
export interface ToastAction {
    label: string;
    to: string;
    state?: unknown;
}

export interface ToastData {
    id: number;
    text: string;
    // Ссылка справа от текста, например «Открыть» черновик
    action?: ToastAction;
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
