import clsx from "clsx";
import { motion } from "motion/react";
import { type ReactNode } from "react";

import { TRANSITION_PAGE } from "@/shared/config/animation";

import styles from "./PageWrapper.module.scss";

interface PageWrapperProps {
    children: ReactNode;
    header?: ReactNode;
    className?: string;
}

const HIDDEN = { opacity: 0, y: 8, filter: "blur(6px)" };
const VISIBLE = { opacity: 1, y: 0, filter: "blur(0px)", transitionEnd: { filter: "none" } };

export function PageWrapper(props: PageWrapperProps) {
    const { children, header, className } = props;

    return (
        <motion.main
            className={clsx(styles.wrapper, className)}
            initial={HIDDEN}
            animate={VISIBLE}
            exit={HIDDEN}
            transition={TRANSITION_PAGE}
        >
            {header}
            {children}
        </motion.main>
    );
}
