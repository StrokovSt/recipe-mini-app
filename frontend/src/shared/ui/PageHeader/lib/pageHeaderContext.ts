import { createContext, useContext } from "react";

interface PageHeaderContextValue {
    bar: HTMLElement | null;
    setBar: (bar: HTMLElement | null) => void;
}

export const PageHeaderContext = createContext<PageHeaderContextValue>({
    bar: null,
    setBar: () => undefined,
});

// DOM-элемент общей полосы шапки: страницы рендерят в него своё содержимое
export const usePageHeaderBar = () => useContext(PageHeaderContext).bar;
