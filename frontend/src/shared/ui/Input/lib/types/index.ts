import { Control, FieldValues, Path, RegisterOptions, UseFormRegisterReturn } from "react-hook-form";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    register?: UseFormRegisterReturn;
    error?: string;
    suffix?: string;
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
}