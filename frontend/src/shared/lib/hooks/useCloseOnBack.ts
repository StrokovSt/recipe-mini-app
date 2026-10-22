import { useEffect, useEffectEvent, useRef } from "react";

// Отметка своей записи в истории: по ней понятно, что мы всё ещё на ней
const HISTORY_MARK = "closeOnBack";

// Пока окно открыто, системная «Назад» на телефоне закрывает его, а не уводит со страницы:
// в истории лежит лишняя запись с тем же адресом, «Назад» снимает её и вызывает onClose.
// Возвращает close: закрывать окно кнопками надо через неё, чтобы запись ушла вместе с окном.
// Переход на другую страницу прямо из окна делаем с replace: он займёт место лишней записи
export const useCloseOnBack = (isOpen: boolean, onClose: () => void) => {
    const hasHistoryEntryRef = useRef(false);

    const handlePopState = useEffectEvent(() => {
        hasHistoryEntryRef.current = false;
        onClose();
    });

    useEffect(() => {
        if (!isOpen) return;

        if (!hasHistoryEntryRef.current) {
            window.history.pushState({ ...window.history.state, [HISTORY_MARK]: true }, "");
            hasHistoryEntryRef.current = true;
        }
        window.addEventListener("popstate", handlePopState);
        return () => window.removeEventListener("popstate", handlePopState);
    }, [isOpen]);

    // Окно закрыли не через close (сохранили форму в шторке и т. п.): убираем свою запись,
    // иначе первое «Назад» потом ничего не сделает. Если запись уже заменили переходом, не трогаем.
    // Проверяем после текущих задач: роутер меняет историю не сразу, а чуть позже клика
    useEffect(() => {
        if (isOpen || !hasHistoryEntryRef.current) return;

        hasHistoryEntryRef.current = false;
        window.setTimeout(() => {
            if (window.history.state?.[HISTORY_MARK]) window.history.back();
        });
    }, [isOpen]);

    return () => {
        if (hasHistoryEntryRef.current) window.history.back();
        else onClose();
    };
};
