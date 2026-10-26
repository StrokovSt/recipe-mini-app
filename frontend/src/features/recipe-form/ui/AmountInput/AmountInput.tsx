import { type ChangeEvent, useState } from "react";

import { Input } from "@/shared/ui/Input";

interface AmountInputProps {
    value: number | null;
    onChange: (value: number | null) => void;
    onBlur?: () => void;
    label: string;
    className?: string;
    error?: string;
}

// Цифры и один разделитель: «0,5» и «0.5» дают 0.5
const AMOUNT_REGEX = /^\d*[.,]?\d*$/;

const parse = (text: string) => {
    const number = Number(text.replace(",", "."));
    return text === "" || Number.isNaN(number) ? null : number;
};

const format = (value: number | null) => (value === null ? "" : String(value));

// Количество ингредиента полем «строкой», может быть дробным. Текст хранится отдельно от числа,
// чтобы «0,» не превращалось в «0» прямо во время ввода
const AmountInput = (props: AmountInputProps) => {
    const { value, onChange, onBlur, label, className, error } = props;
    const [text, setText] = useState(format(value));
    const [prevValue, setPrevValue] = useState(value);

    // Значение поменяли снаружи (распознанный рецепт, редактирование) — показываем его
    if (value !== prevValue) {
        setPrevValue(value);
        if (parse(text) !== value) setText(format(value));
    }

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        const next = event.target.value.trim();
        if (!AMOUNT_REGEX.test(next)) return;

        setText(next);
        onChange(parse(next));
    };

    return (
        <Input
            variant="line"
            type="text"
            inputMode="decimal"
            label={label}
            value={text}
            error={error}
            className={className}
            onChange={handleChange}
            onBlur={onBlur}
        />
    );
};

export default AmountInput;
