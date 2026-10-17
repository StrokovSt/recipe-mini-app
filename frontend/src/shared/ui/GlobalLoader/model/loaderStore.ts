// Глобальный котик: один на всё приложение. Загрузки регистрируются задачами.
import type { LoaderName } from "@/shared/ui/Spinner";

// Котик виден, пока есть хоть одна задача, дождавшаяся своей задержки, и не меньше MIN_VISIBLE_MS
export interface LoaderOptions {
    // Подпись под котиком, например «Распознаём рецепт…»
    label?: string;
    // Через сколько мс показать котика: быстрые загрузки проходят без него. 0 — сразу
    delay?: number;
    // Какой котик, по умолчанию обычный
    loader?: LoaderName;
}

export interface LoaderState {
    isVisible: boolean;
    // Котик уже скрыт, но ещё гаснет: контент страницы ждёт, чтобы не просвечивать сквозь него
    isLeaving: boolean;
    label?: string;
    loader?: LoaderName;
}

interface Task {
    label?: string;
    loader?: LoaderName;
    isDue: boolean;
    isHandedOff: boolean;
    timer?: ReturnType<typeof setTimeout>;
}

const DEFAULT_DELAY = 300;
const MIN_VISIBLE_MS = 1000;
const HANDOFF_TIMEOUT_MS = 15000;

const tasks = new Map<number, Task>();
const listeners = new Set<() => void>();
let nextId = 1;
let state: LoaderState = { isVisible: false, isLeaving: false };
let shownAt = 0;
let hideTimer: ReturnType<typeof setTimeout> | undefined;

function setState(next: LoaderState) {
    if (
        next.isVisible === state.isVisible
        && next.isLeaving === state.isLeaving
        && next.label === state.label
        && next.loader === state.loader
    ) return;
    state = next;
    listeners.forEach((listener) => listener());
}

function update() {
    const due = [...tasks.values()].filter((task) => task.isDue);

    if (due.length > 0) {
        clearTimeout(hideTimer);
        hideTimer = undefined;
        if (!state.isVisible) shownAt = Date.now();
        // Подпись и котик последней задачи, у которой они есть
        const latest = due.reverse();
        const label = latest.find((task) => task.label)?.label;
        const loader = latest.find((task) => task.loader)?.loader;
        setState({ isVisible: true, isLeaving: false, label, loader });
        return;
    }

    if (!state.isVisible || hideTimer) return;

    // Подпись и котика не сбрасываем, чтобы он уходил тем же
    hideTimer = setTimeout(() => {
        hideTimer = undefined;
        setState({ ...state, isVisible: false, isLeaving: true });
    }, Math.max(0, MIN_VISIBLE_MS - (Date.now() - shownAt)));
}

export function startLoading({ label, delay = DEFAULT_DELAY, loader }: LoaderOptions = {}): number {
    const id = nextId++;
    const task: Task = { label, loader, isDue: delay === 0, isHandedOff: false };

    if (!task.isDue) {
        task.timer = setTimeout(() => {
            task.isDue = true;
            update();
        }, delay);
    }

    tasks.set(id, task);
    update();
    return id;
}

export function finishLoading(id: number) {
    const task = tasks.get(id);
    if (!task) return;

    clearTimeout(task.timer);
    tasks.delete(id);
    update();
}

// Загрузка переживает свою страницу: котик остаётся, пока не отрисуется следующая
export function handOffLoading(id: number) {
    const task = tasks.get(id);
    if (!task) return;

    task.isHandedOff = true;
    setTimeout(() => finishLoading(id), HANDOFF_TIMEOUT_MS);
}

// Новая страница отрисовалась: завершает переданные ей загрузки
export function finishHandedOffLoading() {
    tasks.forEach((task, id) => {
        if (task.isHandedOff) finishLoading(id);
    });
}

// Котик догас (onExitComplete в GlobalLoader)
export function finishLeaving() {
    if (state.isVisible) return;
    setState({ ...state, isLeaving: false });
}

export function subscribeLoader(listener: () => void) {
    listeners.add(listener);
    return () => {
        listeners.delete(listener);
    };
}

export const getLoaderState = () => state;
