import { getTelegram } from "@/shared/lib/telegram";

// Короткая вибрация на важное действие: в Telegram через его API, в браузере (Android) через vibrate.
// На iPhone в браузере вибрации нет, там просто ничего не происходит
export const impactHaptic = () => {
    const telegram = getTelegram();
    if (telegram?.initData) {
        telegram.HapticFeedback.impactOccurred("medium");
        return;
    }

    navigator.vibrate?.(10);
};
