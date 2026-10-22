import WebApp from "@twa-dev/sdk";

// Короткая вибрация на важное действие: в Telegram через его API, в браузере (Android) через vibrate.
// На iPhone в браузере вибрации нет, там просто ничего не происходит
export const impactHaptic = () => {
    if (WebApp.initData) {
        WebApp.HapticFeedback.impactOccurred("medium");
        return;
    }

    navigator.vibrate?.(10);
};
