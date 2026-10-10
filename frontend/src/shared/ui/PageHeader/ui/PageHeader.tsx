import clsx from "clsx";
import { motion } from "motion/react";
import { type ReactNode } from "react";
import { createPortal } from "react-dom";

import { TRANSITION_PAGE } from "@/shared/config/animation";

import { usePageHeaderBar } from "../lib/pageHeaderContext";

import styles from "./PageHeader.module.scss";

interface PageHeaderProps {
    children: ReactNode;
    className?: string;
}

const HIDDEN = { opacity: 0 };
const VISIBLE = { opacity: 1 };

// Содержимое шапки страницы: порталом в общую полосу PageHeaderBar,
// при смене страницы меняется лёгким fade
export function PageHeader(props: PageHeaderProps) {
    const { children, className } = props;
    const bar = usePageHeaderBar();

    if (!bar) return null;

    return createPortal(
        <motion.div
            className={clsx(styles.header, className)}
            initial={HIDDEN}
            animate={VISIBLE}
            exit={HIDDEN}
            transition={TRANSITION_PAGE}
        >
            {children}
        </motion.div>,
        bar
    );
}
