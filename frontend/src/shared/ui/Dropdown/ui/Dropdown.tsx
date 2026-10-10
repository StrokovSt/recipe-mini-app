import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import clsx from "clsx";
import { Fragment, type ReactElement, type ReactNode } from "react";

import styles from "./Dropdown.module.scss";

export interface DropdownItem {
    label: string;
    onClick: () => void;
    icon?: ReactNode;
    danger?: boolean;
}

interface DropdownProps {
    // Кнопка, по которой открывается меню
    trigger: ReactElement;
    items: DropdownItem[];
    className?: string;
}

// Всплывающее меню у кнопки: закрывается по клику вне окна и по Esc
export const Dropdown = (props: DropdownProps) => {
    const { trigger, items, className } = props;

    return (
        <Menu>
            <MenuButton as={Fragment}>{trigger}</MenuButton>

            <MenuItems transition anchor="bottom end" className={clsx(styles.menu, className)}>
                {items.map((item) => (
                    <MenuItem key={item.label}>
                        <button
                            type="button"
                            className={clsx(styles.item, item.danger && styles.danger)}
                            onClick={item.onClick}
                        >
                            {item.icon}
                            {item.label}
                        </button>
                    </MenuItem>
                ))}
            </MenuItems>
        </Menu>
    );
};
