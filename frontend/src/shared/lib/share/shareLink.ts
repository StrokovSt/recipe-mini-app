import { getTelegram } from "@/shared/lib/telegram";

// Делится ссылкой: в Telegram открывает выбор чата, в браузере — системное меню «Поделиться»,
// а где его нет, копирует ссылку. "copied" — скопировали, стоит показать подсказку
export const shareLink = async (url: string, text: string): Promise<"shared" | "copied"> => {
    const telegram = getTelegram();
    if (telegram?.initData) {
        telegram.openTelegramLink(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`);
        return "shared";
    }

    if (navigator.share) {
        // Закрыл меню, ничего не выбрав, — это не ошибка
        await navigator.share({ title: text, url }).catch(() => undefined);
        return "shared";
    }

    await copyText(url);
    return "copied";
};

// navigator.clipboard, как и navigator.share, есть только на https и localhost.
// По http (телефон в локальной сети, http://192.168…:5173) копируем по-старому, через скрытое поле
const copyText = async (text: string) => {
    if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
        return;
    }

    const field = document.createElement("textarea");
    field.value = text;
    field.style.position = "fixed";
    field.style.opacity = "0";
    document.body.append(field);
    field.select();
    document.execCommand("copy");
    field.remove();
};
