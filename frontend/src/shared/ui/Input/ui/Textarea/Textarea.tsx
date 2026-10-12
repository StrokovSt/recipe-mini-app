import clsx from "clsx";
import { useEffect, useRef } from "react";

import type { TextareaProps } from "../../lib/types";

import styles from "./Textarea.module.scss";

// Высота по тексту; scrollHeight без рамки, её добавляем, иначе последняя строка обрезается
const fitHeight = (el: HTMLTextAreaElement) => {
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight + el.offsetHeight - el.clientHeight}px`;
};

export const Textarea = (props: TextareaProps) => {
    const { label, register, error, className, ...rest } = props;
    const textareaRef = useRef<HTMLTextAreaElement>(null);

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
        <div className={clsx(styles.wrap, className)}>
            <textarea
                ref={textareaRef}
                className={clsx(styles.textarea, { [styles.textareaError]: error })}
                placeholder=" "
                rows={1}
                autoComplete="off"
                aria-invalid={error ? true : undefined}
                {...rest}
                {...register}
            />
            <label className={styles.label}>{label}</label>
            {error && <span className={styles.error}>{error}</span>}
        </div>
    );
};