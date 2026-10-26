import clsx from "clsx";
import { type FocusEvent, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import type { UnitCode } from "@recipe/common";

import { BottomSheet } from "@/shared/ui/BottomSheet";
import { Input } from "@/shared/ui/Input";

import { getUnitsByKind, UNIT_KINDS } from "../../model/units";

import styles from "./UnitSelect.module.scss";

interface UnitSelectProps {
    value: UnitCode | null;
    onChange: (unit: UnitCode | null) => void;
    className?: string;
}

// Следующее поле формы после этого, как при «Далее» на клавиатуре телефона
const focusNextField = (input: HTMLInputElement) => {
    const fields = Array.from(input.form?.elements ?? []).filter(
        (el): el is HTMLInputElement | HTMLTextAreaElement =>
            (el instanceof HTMLInputElement && el.type !== "file" && !el.disabled) ||
            (el instanceof HTMLTextAreaElement && !el.disabled)
    );

    fields[fields.indexOf(input) + 1]?.focus();
};

// Поле с единицей ингредиента (выглядит как остальные поля строки, без видимой подписи), по тапу или фокусу шторка со всеми единицами по группам.
// Поле не readOnly, иначе «Далее» на клавиатуре его пропускает; печатать в нём нельзя: inputMode none и значение не меняется
const UnitSelect = ({ value, onChange, className }: UnitSelectProps) => {
    const { t, i18n } = useTranslation(["recipeForm", "units"]);
    const [isOpen, setIsOpen] = useState(false);
    // Шторка при закрытии возвращает фокус в поле: после выбора передаём его дальше, после отмены оставляем
    const afterCloseRef = useRef<"next" | "stay" | null>(null);

    const close = (after: "next" | "stay") => {
        afterCloseRef.current = after;
        setIsOpen(false);
    };

    const select = (unit: UnitCode | null) => {
        onChange(unit);
        close("next");
    };

    const handleFocus = (event: FocusEvent<HTMLInputElement>) => {
        const after = afterCloseRef.current;
        afterCloseRef.current = null;

        if (after === "next") focusNextField(event.currentTarget);
        else if (after === null) setIsOpen(true);
    };

    return (
        <>
            <Input
                variant="line"
                hideLabel
                inputMode="none"
                autoComplete="off"
                label={t("ingredients.unit")}
                value={value ? t(`units:label.${value}`) : ""}
                className={clsx(styles.field, className)}
                aria-haspopup="dialog"
                onChange={() => undefined}
                onFocus={handleFocus}
                onClick={() => setIsOpen(true)}
                onKeyDown={(event) => {
                    if (event.key !== "Enter" && event.key !== " ") return;
                    event.preventDefault();
                    setIsOpen(true);
                }}
            />

            <BottomSheet isOpen={isOpen} onClose={() => close("stay")} title={t("ingredients.unitTitle")}>
                {UNIT_KINDS.map((kind) => (
                    <section key={kind} className={styles.group}>
                        <h3 className={styles.title}>{t(`units:kind.${kind}`)}</h3>
                        <div className={styles.list}>
                            {getUnitsByKind(kind, i18n.language).map((unit) => (
                                <button
                                    key={unit}
                                    type="button"
                                    className={styles.option}
                                    aria-pressed={unit === value}
                                    onClick={() => select(unit)}
                                >
                                    {t(`units:label.${unit}`)}
                                </button>
                            ))}
                        </div>
                    </section>
                ))}

                <button
                    type="button"
                    className={styles.option}
                    aria-pressed={value === null}
                    onClick={() => select(null)}
                >
                    {t("ingredients.noUnit")}
                </button>
            </BottomSheet>
        </>
    );
};

export default UnitSelect;
