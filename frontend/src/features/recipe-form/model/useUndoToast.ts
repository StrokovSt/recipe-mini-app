import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";

import { showToast } from "@/shared/ui/Toast";

// Уведомление после удаления строки, группы или шага: «Вернуть» ставит удалённое на прежнее место.
// Видно только на странице формы
export const useUndoToast = () => {
    const { t } = useTranslation("recipeForm");
    const { pathname } = useLocation();

    return (text: string, onRestore: () => void) =>
        showToast({ text, path: pathname, action: { label: t("restore"), onClick: onRestore } });
};
