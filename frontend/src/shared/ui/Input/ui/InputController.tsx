import { Controller, FieldValues } from "react-hook-form";

import type { InputControllerProps } from "../lib/types";
import { Input } from "./Input";


export const InputController = <TForm extends FieldValues>(props: InputControllerProps<TForm>) => {
    const { name, control, rules, label, suffix, type, disabled, className } = props;

    return (
        <Controller
            control={control}
            name={name}
            rules={rules}
            render={({ field, fieldState }) => (
                <Input
                    label={label}
                    suffix={suffix}
                    type={type}
                    disabled={disabled}
                    className={className}
                    error={fieldState.error?.message}
                    value={field.value ?? ""}
                    onChange={(e) => {
                        const val = e.target.value;
                        field.onChange(type === "number" ? (val === "" ? null : Number(val)) : val);
                    }}
                    onBlur={field.onBlur}
                />
            )}
        />
    );
};