import clsx from "clsx";
import { type ReactNode } from "react";

import styles from "./PageWrapper.module.scss";

interface PageWrapperProps {
    children: ReactNode;
    header?: ReactNode;
    className?: string;
}

export function PageWrapper(props: PageWrapperProps) {
    const { children, header, className } = props;

    return (
        <main className={clsx(styles.wrapper, className)}>
            {header}
            {children}
        </main>
    );
}
