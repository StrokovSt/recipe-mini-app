import { useEffect, useEffectEvent, useId, useRef } from "react";

// Отметка своей записи в истории: по ней понятно, что мы всё ещё на ней.
// В отметке id окна: следующее окно, открытое сразу за этим, своей записью не собьёт проверку
const HISTORY_MARK = "closeOnBack";

// Пока окно открыто, системная «Назад» на телефоне закрывает его, а не уводит со страницы:
// в истории лежит лишняя запись с тем же адресом, «Назад» снимает её и вызывает onClose.
// Возвращает close: закрывать окно кнопками надо через неё, чтобы запись ушла вместе с окном.
// Переход на другую страницу прямо из окна делаем с replace: он займёт место лишней записи
export const useCloseOnBack = (isOpen: boolean, onClose: () => void) => {
    const id = useId();
    const hasHistoryEntryRef = useRef(false);

    const handlePopState = useEffectEvent(() => {
        hasHistoryEntryRef.current = false;
        onClose();
    });

    useEffect(() => {
        if (!isOpen) return;

        if (!hasHistoryEntryRef.current) {
            window.history.pushState({ ...window.history.state, [HISTORY_MARK]: id }, "");
            hasHistoryEntryRef.current = true;
        }
        window.addEventListener("popstate", handlePopState);
        return () => window.removeEventListener("popstate", handlePopState);
    }, [isOpen, id]);

    // Окно закрыли не через close (сохранили форму в шторке и т. п.): убираем свою запись,
    // иначе первое «Назад» потом ничего не сделает. Если запись уже заменили переходом, не трогаем.
    // Проверяем после текущих задач: роутер меняет историю не сразу, а чуть позже клика
    useEffect(() => {
        if (isOpen || !hasHistoryEntryRef.current) return;

        hasHistoryEntryRef.current = false;
        window.setTimeout(() => {
            if (window.history.state?.[HISTORY_MARK] === id) window.history.back();
        });
    }, [isOpen, id]);

    return () => {
        if (hasHistoryEntryRef.current) window.history.back();
        else onClose();
    };
};
