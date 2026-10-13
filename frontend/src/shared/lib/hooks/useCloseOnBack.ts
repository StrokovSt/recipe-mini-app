import { useEffect, useEffectEvent, useRef } from "react";

// Пока окно открыто, системная «Назад» на телефоне закрывает его, а не уводит со страницы:
// в истории лежит лишняя запись с тем же адресом, «Назад» снимает её и вызывает onClose.
// Возвращает close: закрывать окно кнопками надо через неё, чтобы запись ушла вместе с окном
export const useCloseOnBack = (isOpen: boolean, onClose: () => void) => {
    const hasHistoryEntryRef = useRef(false);

    const handlePopState = useEffectEvent(() => {
        hasHistoryEntryRef.current = false;
        onClose();
    });

    useEffect(() => {
        if (!isOpen) return;

        if (!hasHistoryEntryRef.current) {
            window.history.pushState(window.history.state, "");
            hasHistoryEntryRef.current = true;
        }
        window.addEventListener("popstate", handlePopState);
        return () => window.removeEventListener("popstate", handlePopState);
    }, [isOpen]);

    return () => {
        if (hasHistoryEntryRef.current) window.history.back();
        else onClose();
    };
};
