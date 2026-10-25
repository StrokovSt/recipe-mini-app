import { useTranslation } from "react-i18next";

import { OutlineButton } from "@/shared/ui/Buttons";

import { Message } from "./Message";

interface LoadErrorMessageProps {
    onRetry: () => void;
}

// Данные не загрузились (сервер не ответил, нет сети): котик и «Повторить» вместо пустого списка или «не найдено»
export function LoadErrorMessage(props: LoadErrorMessageProps) {
    const { onRetry } = props;
    const { t } = useTranslation();

    return (
        <Message
            illustration="error"
            title={t("loadError.title")}
            text={t("loadError.text")}
            action={<OutlineButton type="button" label={t("loadError.retry")} onClick={onRetry} />}
        />
    );
}
