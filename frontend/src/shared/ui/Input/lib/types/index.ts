import type { Control, FieldValues, Path, RegisterOptions, UseFormRegisterReturn } from "react-hook-form";

// box — в рамке; line — «строкой», без рамки, только линия снизу (форма рецепта). В обоих подпись поднимается над текстом
export type FieldVariant = "box" | "line";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    register?: UseFormRegisterReturn;
    error?: string;
    suffix?: string;
    variant?: FieldVariant;
    // Подпись только для экранного диктора, в пустом поле она видна подсказкой, а поле ниже. Только для variant="line"
    hideLabel?: boolean;
}

type FormValues = FieldValues;

export interface InputControllerProps<TForm extends FormValues> {
    name: Path<TForm>;
    control: Control<TForm>;
    label: string;
    rules?: RegisterOptions<TForm, Path<TForm>>;
    className?: string;
    placeholder?: string;
    disabled?: boolean;
    suffix?: string;
    error?: string;
    type?: string;
    variant?: FieldVariant;
}

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label: string;
    register?: UseFormRegisterReturn;
    error?: string;
    variant?: FieldVariant;
    // Подпись только для экранного диктора, в пустом поле видна подсказка placeholder. Только для variant="line"
    hideLabel?: boolean;
}

export interface TextareaControllerProps<TForm extends FormValues> {
    name: Path<TForm>;
    control: Control<TForm>;
    label: string;
    rules?: RegisterOptions<TForm, Path<TForm>>;
    className?: string;
    disabled?: boolean;
    error?: string;
    variant?: FieldVariant;
    hideLabel?: boolean;
    placeholder?: string;
}