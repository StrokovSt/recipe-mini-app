import i18next from "i18next";
import { useEffect, useRef } from "react";

import type { UpdateUserSettingsDto } from "@recipe/common";

import { getAnimations, getSavedAnimations, setAnimations } from "@/shared/lib/animations";
import { getSavedLanguage, isLanguage, setLanguage } from "@/shared/lib/i18n";
import { getSavedTheme, getTheme, setTheme } from "@/shared/lib/theme";

import { useMe, useUpdateSettings } from "../hooks";

// Один раз после загрузки профиля сверяет настройки устройства и сервера:
// выбор на сервере применяется на устройстве, а если на сервере пусто,
// туда уходит выбор, сохранённый на устройстве
export const useSyncSettings = () => {
    const { data: user } = useMe();
    const { mutate: updateSettings } = useUpdateSettings();
    const isSynced = useRef(false);

    useEffect(() => {
        if (!user || isSynced.current) return;
        isSynced.current = true;

        const local: UpdateUserSettingsDto = {};

        if (user.theme) {
            if (user.theme !== getTheme()) setTheme(user.theme);
        } else {
            const saved = getSavedTheme();
            if (saved) local.theme = saved;
        }

        if (user.animations !== null) {
            if (user.animations !== getAnimations()) setAnimations(user.animations);
        } else {
            const saved = getSavedAnimations();
            if (saved !== null) local.animations = saved;
        }

        if (isLanguage(user.language)) {
            if (user.language !== i18next.language) void setLanguage(user.language);
        } else {
            const saved = getSavedLanguage();
            if (saved) local.language = saved;
        }

        if (Object.keys(local).length > 0) updateSettings(local);
    }, [user, updateSettings]);
};
