import { useSyncExternalStore } from "react";

// Раскладка по ширине экрана: телефон, планшет (рейка сбоку), компьютер (боковая панель), ultrawide.
// Границы повторяют shared/styles/media.scss
export type LayoutMode = "phone" | "tablet" | "desktop" | "wide";

// От самой широкой: берётся первая подходящая
const MODES: { mode: LayoutMode; query: string }[] = [
    { mode: "wide", query: "(width >= 1920px)" },
    { mode: "desktop", query: "(width >= 1200px)" },
    { mode: "tablet", query: "(width >= 768px)" },
];

const getLayoutMode = (): LayoutMode => MODES.find(({ query }) => matchMedia(query).matches)?.mode ?? "phone";

// Окно растянули или сузили через границу: компоненты перерисовываются с новой раскладкой
const subscribe = (onChange: () => void) => {
    const lists = MODES.map(({ query }) => matchMedia(query));
    lists.forEach((list) => list.addEventListener("change", onChange));

    return () => lists.forEach((list) => list.removeEventListener("change", onChange));
};

export const useLayoutMode = () => useSyncExternalStore(subscribe, getLayoutMode);
