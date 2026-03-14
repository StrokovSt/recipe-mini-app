import clsx from "clsx";

import styles from "./Tabs.module.scss";

interface Tab<T extends string> {
    id: T;
    label: string;
}

interface TabsProps<T extends string> {
    tabs: Tab<T>[];
    active: T;
    onChange: (id: T) => void;
    className?: string;
}

export const Tabs = <T extends string>({ tabs, active, onChange, className }: TabsProps<T>) => {
    return (
        <div className={clsx(styles.wrap, className)}>
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    type="button"
                    className={clsx(styles.tab, active === tab.id && styles.tabActive)}
                    onClick={() => onChange(tab.id)}
                >
                    {tab.label}
                </button>
            ))}
        </div>
    );
};