import clsx from "clsx";
import { useEffect, useRef } from "react";

import { TextareaProps } from "../../lib/types";

import styles from "./Textarea.module.scss";

export const Textarea = (props: TextareaProps) => {
    const { label, register, error, className, ...rest } = props;
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        const el = textareaRef.current;
        if (!el) return;
        el.style.height = "auto";
        el.style.height = `${el.scrollHeight}px`;
    }, [rest.value]);

    return (
        <div className={clsx(styles.wrap, className)}>
            <textarea
                ref={textareaRef}
                className={clsx(styles.textarea, { [styles.textareaError]: error })}
                placeholder=" "
                rows={1}
                {...rest}
                {...register}
            />
            <label className={styles.label}>{label}</label>
            {error && <span className={styles.error}>{error}</span>}
        </div>
    );
};