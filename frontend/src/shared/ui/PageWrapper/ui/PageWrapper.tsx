import clsx from "clsx";
import { type ReactNode } from "react";

import styles from "./PageWrapper.module.scss";

interface PageWrapperProps {
    children: ReactNode;
    className?: string;
}

export function PageWrapper(props: PageWrapperProps) {
    const {children, className} = props;

    return (
            <main
                className={clsx(styles.wrapper, className)}
            >
                {children}
            </main>
    );
}