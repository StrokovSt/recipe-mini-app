import clsx from "clsx";
import { type ReactNode } from "react";

import styles from "./PageHeader.module.scss";

interface PageHeaderProps {
    children: ReactNode;
    className?: string;
}

export function PageHeader(props: PageHeaderProps) {
    const { children, className } = props;

    return (
        <header className={clsx(styles.header, className)}>
            {children}
        </header>
    );
}
