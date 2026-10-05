import { Control, FieldValues, Path, RegisterOptions } from "react-hook-form";

export interface SelectOption<T extends string | number = string> {
    value: T;
    label: string;
}

export interface SelectProps<T extends string | number = string> {
    value: T | "";
    options: SelectOption<T>[];
    onChange: (value: T | "") => void;
    className?: string;
    placeholder?: string;
    error?: string;
    disabled?: boolean;
    required?: boolean;
    searchable?: boolean;
    clearable?: boolean;
    changeHandler?: (option: SelectOption<T>) => void;
}

export type FormValues = FieldValues;

export interface SelectControllerProps<
    TForm extends FormValues,
    T extends string | number = string
> {
    name: Path<TForm>;
    control: Control<TForm>;
    options: SelectOption<T>[];
    className?: string;
    placeholder?: string;
    disabled?: boolean;
    required?: boolean;
    searchable?: boolean;
    clearable?: boolean;
    rules?: RegisterOptions<TForm, Path<TForm>>;
    changeHandler?: (option: SelectOption<T>) => void;
}