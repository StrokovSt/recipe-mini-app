import { Combobox } from "@headlessui/react";
import clsx from "clsx";
import { useRef, useState } from "react";

import CheckIcon from "@/shared/assets/icons/icon-check.svg?react";
import ChevronIcon from "@/shared/assets/icons/icon-chevron.svg?react";
import CloseIcon from "@/shared/assets/icons/icon-close.svg?react";
import { useOnClickOutside } from "@/shared/lib/hooks";

import { SelectOption, SelectProps } from "../lib";

import styles from "./Select.module.scss";

const Select = <T extends string | number = string>(props: SelectProps<T>) => {
    const {
        options,
        value = "",
        onChange,
        className,
        placeholder,
        disabled,
        required,
        searchable = false,
        clearable = true,
        changeHandler,
        error,
    } = props;

    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState("");
    const containerRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find((o) => String(o.value) === String(value)) ?? null;
    const hasValue = value !== "" && value !== null && value !== undefined;

    const filteredOptions = query === ""
        ? options
        : options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase()));

    const handleSelect = (option: SelectOption<T> | null) => {
        if (!option) return;
        changeHandler?.(option);
        onChange(option.value);
        setQuery("");
        setIsOpen(false);
    };

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        onChange(null as unknown as T | "");
    };

    useOnClickOutside(containerRef as React.RefObject<HTMLElement>, () => {
        setIsOpen(false);
        setQuery("");
    });

    return (
        <Combobox
            as="div"
            ref={containerRef}
            className={clsx(styles.container, error && styles.containerError, className)}
            value={selectedOption}
            onChange={handleSelect}
            disabled={disabled}
        >
            <Combobox.Input
                className={clsx(styles.input, !searchable && styles.inputReadonly)}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={placeholder}
                displayValue={(option: SelectOption<T> | null) => option?.label ?? ""}
                readOnly={!searchable}
                onClick={() => setIsOpen((prev) => !prev)}
            />
            <Combobox.Label className={clsx(styles.label, (hasValue || isOpen) && styles.labelFloating)}>
                {placeholder}
            </Combobox.Label>

            <span className={styles.indicators}>
                {clearable && !required && hasValue && (
                    <button type="button" className={styles.clearBtn} onClick={handleClear}>
                        <CloseIcon />
                    </button>
                )}
                <Combobox.Button
                    className={clsx(styles.chevronBtn, isOpen && styles.chevronBtnOpen)}
                    onClick={() => setIsOpen((prev) => !prev)}
                >
                    <ChevronIcon />
                </Combobox.Button>
            </span>

            {isOpen && (
                <Combobox.Options static className={styles.menu}>
                    {filteredOptions.length > 0 ? (
                        filteredOptions.map((option) => (
                            <Combobox.Option
                                key={option.value}
                                value={option}
                                className={clsx(
                                    styles.option,
                                    String(value) === String(option.value) && styles.optionSelected
                                )}
                            >
                                {option.label}
                                {String(value) === String(option.value) && (
                                    <CheckIcon className={styles.optionCheck} />
                                )}
                            </Combobox.Option>
                        ))
                    ) : (
                        <div className={styles.empty}>Ничего не найдено</div>
                    )}
                </Combobox.Options>
            )}

            {error && <span className={styles.error}>{error}</span>}
        </Combobox>
    );
};

export default Select;