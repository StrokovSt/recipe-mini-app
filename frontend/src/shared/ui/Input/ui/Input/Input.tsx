import clsx from "clsx";
import { useId } from "react";

import type { InputProps } from "../../lib/types";

import styles from "./Input.module.scss";

export const Input = (props: InputProps) => {
    const { label, register, error, suffix, variant = "box", className, ...rest } = props;
    // Связь подписи с полем: экранный диктор читает подпись как название поля, клик по ней ставит фокус
    const id = useId();
    const isLine = variant === "line";

    const hasValue = !!rest.value || !!rest.defaultValue;

    return (
        <div className={clsx(styles.wrap, isLine && styles.line, className)}>
            <input
                id={id}
                className={clsx(isLine ? styles.lineInput : styles.input, {
                    [styles.inputNumber]: rest.type === "number",
                    [styles.inputError]: error,
                })}
                placeholder=" "
                autoComplete="off"
                aria-invalid={error ? true : undefined}
                {...rest}
                {...register}
            />
            <label htmlFor={id} className={isLine ? styles.lineLabel : styles.label}>{label}</label>
            {suffix && hasValue && (
                // Суффикс встаёт сразу за текстом: перед ним невидимая копия значения той же ширины
                <span className={styles.after}>
                    <span className={styles.ghost} aria-hidden>{rest.value}</span>
                    <span className={styles.suffix}>{suffix}</span>
                </span>
            )}
            {error && <span className={styles.error}>{error}</span>}
        </div>
    );
};