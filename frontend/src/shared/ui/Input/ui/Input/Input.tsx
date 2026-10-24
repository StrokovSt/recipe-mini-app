import clsx from "clsx";
import { useId } from "react";

import type { InputProps } from "../../lib/types";

import styles from "./Input.module.scss";

export const Input = (props: InputProps) => {
    const { label, register, error, suffix, className, ...rest } = props;
    // Связь подписи с полем: экранный диктор читает подпись как название поля, клик по ней ставит фокус
    const id = useId();

    const hasValue = !!rest.value || !!rest.defaultValue;

    return (
        <div className={clsx(styles.wrap, className)}>
            <input
                id={id}
                className={clsx(styles.input, {
                    [styles.inputNumber]: rest.type === "number",
                    [styles.inputError]: error,
                })}
                placeholder=" "
                autoComplete="off"
                aria-invalid={error ? true : undefined}
                {...rest}
                {...register}
            />
            <label htmlFor={id} className={styles.label}>{label}</label>
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