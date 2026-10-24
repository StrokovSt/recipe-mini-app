import clsx from "clsx";
import { AnimatePresence, m } from "motion/react";
import { useSyncExternalStore } from "react";
import { Link } from "react-router-dom";

import { TRANSITION_BASE } from "@/shared/config/animation";

import { getToast, hideToast, subscribeToast } from "../model/toastStore";

import styles from "./Toast.module.scss";

// transform строкой, а не y: так motion отдаёт анимацию браузеру (WAAPI)
const HIDDEN = { opacity: 0, transform: "translateY(8px)" };
const VISIBLE = { opacity: 1, transform: "translateY(0px)" };

interface ToastProps {
    // Положение задаёт место, где стоит уведомление (футер)
    className?: string;
}

// Короткое уведомление, например «Рецепт распознан · Открыть». Показывается через showToast
export function Toast(props: ToastProps) {
    const { className } = props;
    const toast = useSyncExternalStore(subscribeToast, getToast);

    return (
        <AnimatePresence>
            {toast && (
                <m.div
                    key={toast.id}
                    className={clsx(styles.toast, className)}
                    role="status"
                    initial={HIDDEN}
                    animate={VISIBLE}
                    exit={HIDDEN}
                    transition={TRANSITION_BASE}
                >
                    <p className={styles.text}>{toast.text}</p>
                    {toast.action && (
                        <Link
                            to={toast.action.to}
                            state={toast.action.state}
                            className={styles.action}
                            onClick={hideToast}
                        >
                            {toast.action.label}
                        </Link>
                    )}
                </m.div>
            )}
        </AnimatePresence>
    );
}
