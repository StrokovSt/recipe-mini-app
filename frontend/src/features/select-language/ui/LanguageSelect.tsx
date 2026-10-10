import clsx from "clsx";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { useUpdateSettings } from "@/entities/user";
import CheckIcon from "@/shared/assets/icons/icon-check.svg?react";
import ChevronIcon from "@/shared/assets/icons/icon-chevron-right.svg?react";
import { type Language, LANGUAGES } from "@/shared/config/i18n";
import { setLanguage } from "@/shared/lib/i18n";
import { BottomSheet } from "@/shared/ui/BottomSheet";

import styles from "./LanguageSelect.module.scss";

// Строка с текущим языком; по нажатию открывает шторку со списком языков
export const LanguageSelect = () => {
    const { t, i18n } = useTranslation("settings");
    const [isOpen, setIsOpen] = useState(false);
    const { mutate: updateSettings } = useUpdateSettings();

    const current = LANGUAGES.find((language) => language.code === i18n.language) ?? LANGUAGES[0];

    const handleSelect = (language: Language) => {
        setIsOpen(false);
        void setLanguage(language);
        updateSettings({ language });
    };

    return (
        <>
            <button type="button" className={styles.current} onClick={() => setIsOpen(true)}>
                <span className={styles.code}>{current.code}</span>
                <span className={styles.name}>{current.nativeName}</span>
                <span className={styles.english}>{current.englishName}</span>
                <ChevronIcon className={styles.mark} />
            </button>

            <BottomSheet
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                title={t("language.sheetTitle")}
                subtitle={t("language.available", { count: LANGUAGES.length })}
            >
                <div className={styles.list} role="radiogroup" aria-label={t("language.title")}>
                    {LANGUAGES.map((language) => {
                        const isActive = language.code === current.code;

                        return (
                            <button
                                key={language.code}
                                type="button"
                                role="radio"
                                aria-checked={isActive}
                                lang={language.code}
                                className={clsx(styles.option, isActive && styles.optionActive)}
                                onClick={() => handleSelect(language.code)}
                            >
                                <span className={styles.code}>{language.code}</span>
                                <span className={styles.name}>{language.nativeName}</span>
                                <span className={styles.english} lang="en">
                                    {language.englishName}
                                </span>
                                {isActive && <CheckIcon className={styles.mark} />}
                            </button>
                        );
                    })}
                </div>
            </BottomSheet>
        </>
    );
};
