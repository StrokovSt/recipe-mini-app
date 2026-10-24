import clsx from "clsx";
import { type LabelHTMLAttributes, useState } from "react";
import { useTranslation } from "react-i18next";

import SearchIcon from "@/shared/assets/icons/icon-search.svg?react";
import { useDebouncedCallback } from "@/shared/lib/hooks";
import { IconButton } from "@/shared/ui/Buttons";

import styles from "./SearchInput.module.scss";

// Остальные атрибуты (data-*) уходят на корневой label
interface SearchInputProps extends Omit<LabelHTMLAttributes<HTMLLabelElement>, "onChange"> {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    delay?: number;
    className?: string;
    disabled?: boolean;
}

export const SearchInput = (props: SearchInputProps) => {
    const { t } = useTranslation();
    const { value, onChange, placeholder = t("search"), delay = 400, className, disabled, ...rest } = props;
    const [query, setQuery] = useState(value);
    const [prevValue, setPrevValue] = useState(value);
    const { run: debouncedChange, cancel } = useDebouncedCallback(onChange, delay);

    // Значение поменяли снаружи (например, сброс фильтров): подхватываем его прямо при отрисовке
    if (value !== prevValue) {
        setPrevValue(value);
        setQuery(value);
    }

    const handleChange = (next: string) => {
        setQuery(next);
        debouncedChange(next);
    };

    const handleClear = () => {
        cancel();
        setQuery("");
        onChange("");
    };

    return (
        <label className={clsx(styles.wrap, className)} {...rest}>
            <SearchIcon className={styles.icon} aria-hidden />
            <input
                type="search"
                className={styles.input}
                value={query}
                onChange={(event) => handleChange(event.target.value)}
                placeholder=" "
                autoComplete="off"
                disabled={disabled}
            />
            <span className={styles.label}>{placeholder}</span>
            {query && (
                <IconButton
                    icon="close"
                    variant="empty"
                    className={styles.clear}
                    onClick={handleClear}
                    disabled={disabled}
                    aria-label={t("clearSearch")}
                />
            )}
        </label>
    );
};
