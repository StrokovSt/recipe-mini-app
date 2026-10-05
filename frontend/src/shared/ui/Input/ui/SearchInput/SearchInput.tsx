import clsx from "clsx";
import { useEffect, useState } from "react";

import SearchIcon from "@/shared/assets/icons/icon-search.svg?react";
import { useDebouncedCallback } from "@/shared/lib/hooks";
import { IconButton } from "@/shared/ui/Buttons";

import styles from "./SearchInput.module.scss";

interface SearchInputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    delay?: number;
    className?: string;
}

export const SearchInput = (props: SearchInputProps) => {
    const { value, onChange, placeholder = "Поиск", delay = 400, className } = props;
    const [query, setQuery] = useState(value);
    const { run: debouncedChange, cancel } = useDebouncedCallback(onChange, delay);

    // Синхронизация, если значение поменяли снаружи (например, сброс фильтров)
    useEffect(() => {
        setQuery(value);
    }, [value]);

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
        <label className={clsx(styles.wrap, className)}>
            <SearchIcon className={styles.icon} aria-hidden />
            <input
                type="search"
                className={styles.input}
                value={query}
                onChange={(event) => handleChange(event.target.value)}
                placeholder={placeholder}
            />
            {query && (
                <IconButton
                    icon="close"
                    variant="empty"
                    className={styles.clear}
                    onClick={handleClear}
                    aria-label="Очистить поиск"
                />
            )}
        </label>
    );
};
