import clsx from "clsx";
import { useLayoutEffect, useRef } from "react";

import { InputProps } from "../../lib/types";

import styles from "./Input.module.scss";

export const Input = (props: InputProps) => {
    const { label, register, error, suffix, className, ...rest } = props;
    const measureRef = useRef<HTMLSpanElement>(null);
    const suffixRef = useRef<HTMLSpanElement>(null);

    const hasValue = !!rest.value || !!rest.defaultValue;

    useLayoutEffect(() => {
        if (measureRef.current && suffixRef.current) {
            const width = measureRef.current.offsetWidth;
            suffixRef.current.style.left = `calc(var(--space-4) + ${width}px + 4px)`;
        }
    }, [rest.value]);

    return (
        <div className={clsx(styles.wrap, className)}>
            <input
                className={clsx(styles.input, {
                    [styles.inputNumber]: rest.type === "number",
                    [styles.inputError]: error,
                })}
                placeholder=" "
                {...rest}
                {...register}
            />
            <label className={styles.label}>{label}</label>
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