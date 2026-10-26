import { Controller, type FieldValues } from "react-hook-form";

import type { TextareaControllerProps } from "../../lib/types";
import { Textarea } from "./Textarea";

export const TextareaController = <TForm extends FieldValues>(props: TextareaControllerProps<TForm>) => {
    const { name, control, rules, label, disabled, variant, hideLabel, placeholder, className } = props;

    return (
        <Controller
            control={control}
            name={name}
            rules={rules}
            render={({ field, fieldState }) => (
                <Textarea
                    label={label}
                    disabled={disabled}
                    variant={variant}
                    hideLabel={hideLabel}
                    placeholder={placeholder}
                    className={className}
                    error={fieldState.error?.message}
                    value={field.value ?? ""}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                />
            )}
        />
    );
};