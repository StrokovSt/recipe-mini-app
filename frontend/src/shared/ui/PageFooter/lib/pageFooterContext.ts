import { createContext, useContext } from "react";

interface PageFooterContextValue {
    slot: HTMLElement | null;
    setSlot: (slot: HTMLElement | null) => void;
}

export const PageFooterContext = createContext<PageFooterContextValue>({
    slot: null,
    setSlot: () => undefined,
});

// Место под действие страницы внутри общего футера: страницы рендерят в него кнопку
export const usePageFooterSlot = () => useContext(PageFooterContext).slot;

// Футер отдаёт сюда свой элемент-слот
export const useSetPageFooterSlot = () => useContext(PageFooterContext).setSlot;
