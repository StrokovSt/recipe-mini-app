import { Controller, type FieldValues } from "react-hook-form";

import type { InputControllerProps } from "../../lib/types";
import { Input } from "./Input";

export const InputController = <TForm extends FieldValues>(props: InputControllerProps<TForm>) => {
    const { name, control, rules, label, suffix, type, disabled, className } = props;
    // Числа вводятся только цифрами: текстовое поле с цифровой клавиатурой, остальные символы отбрасываем
    const isNumber = type === "number";

    return (
        <Controller
            control={control}
            name={name}
            rules={rules}
            render={({ field, fieldState }) => (
                <Input
                    label={label}
                    suffix={suffix}
                    type={isNumber ? "text" : type}
                    inputMode={isNumber ? "numeric" : undefined}
                    disabled={disabled}
                    className={className}
                    error={fieldState.error?.message}
                    value={field.value ?? ""}
                    onChange={(e) => {
                        const val = e.target.value;
                        if (!isNumber) {
                            field.onChange(val);
                            return;
                        }

                        const digits = val.replace(/\D/g, "");
                        field.onChange(digits === "" ? null : Number(digits));
                    }}
                    onBlur={field.onBlur}
                />
            )}
        />
    );
};