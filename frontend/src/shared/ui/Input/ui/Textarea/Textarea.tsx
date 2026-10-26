import clsx from "clsx";
import { useEffect, useId, useRef } from "react";

import type { TextareaProps } from "../../lib/types";

import styles from "./Textarea.module.scss";

// Высота по тексту; scrollHeight без рамки, её добавляем, иначе последняя строка обрезается
const fitHeight = (el: HTMLTextAreaElement) => {
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight + el.offsetHeight - el.clientHeight}px`;
};

export const Textarea = (props: TextareaProps) => {
    const { label, register, error, variant = "box", hideLabel, placeholder, className, ...rest } = props;
    // Связь подписи с полем: экранный диктор читает подпись как название поля, клик по ней ставит фокус
    const id = useId();
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const isLine = variant === "line";

    useEffect(() => {
        if (textareaRef.current) fitHeight(textareaRef.current);
    }, [rest.value]);

    // Поле стало уже или шире (поворот экрана, рядом появился крестик) — строки переносятся иначе
    useEffect(() => {
        const el = textareaRef.current;
        if (!el) return;

        let width = el.offsetWidth;
        const observer = new ResizeObserver(() => {
            if (el.offsetWidth === width) return;
            width = el.offsetWidth;
            fitHeight(el);
        });
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    return (
        <div className={clsx(styles.wrap, isLine && styles.line, className)}>
            <textarea
                ref={textareaRef}
                id={id}
                className={clsx(isLine ? styles.lineTextarea : styles.textarea, {
                    [styles.textareaError]: error,
                    [styles.noLabel]: hideLabel,
                })}
                // Пробел вместо подсказки: по :placeholder-shown подпись видит, что поле пустое
                placeholder={hideLabel ? placeholder : " "}
                rows={1}
                autoComplete="off"
                aria-invalid={error ? true : undefined}
                {...rest}
                {...register}
            />
            <label
                htmlFor={id}
                className={clsx(isLine ? styles.lineLabel : styles.label, hideLabel && styles.hiddenLabel)}
            >
                {label}
            </label>
            {error && <span className={styles.error}>{error}</span>}
        </div>
    );
};