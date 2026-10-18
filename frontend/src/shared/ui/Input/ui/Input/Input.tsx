import clsx from "clsx";
import { useId, useLayoutEffect, useRef } from "react";

import type { InputProps } from "../../lib/types";

import styles from "./Input.module.scss";

export const Input = (props: InputProps) => {
    const { label, register, error, suffix, className, ...rest } = props;
    // Связь подписи с полем: экранный диктор читает подпись как название поля, клик по ней ставит фокус
    const id = useId();
    const measureRef = useRef<HTMLSpanElement>(null);
    const suffixRef = useRef<HTMLSpanElement>(null);

    const hasValue = !!rest.value || !!rest.defaultValue;

    useLayoutEffect(() => {
        if (measureRef.current && suffixRef.current) {
            const width = measureRef.current.offsetWidth;
            suffixRef.current.style.left = `calc(var(--space-3) + 1px + ${width}px + var(--space-1))`;
        }
    }, [rest.value]);

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
                <>
                    <span ref={measureRef} className={styles.measure} aria-hidden>
                        {rest.value}
                    </span>
                    <span ref={suffixRef} className={styles.suffix}>{suffix}</span>
                </>
            )}
            {error && <span className={styles.error}>{error}</span>}
        </div>
    );
};