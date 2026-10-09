import clsx from "clsx";
import { type ReactNode, type Ref } from "react";

import styles from "./PageHeader.module.scss";

interface PageHeaderProps {
    children: ReactNode;
    className?: string;
    ref?: Ref<HTMLElement>;
}

export function PageHeader(props: PageHeaderProps) {
    const { children, className, ref } = props;

    return (
        <header ref={ref} className={clsx(styles.header, className)}>
            {children}
        </header>
    );
}
