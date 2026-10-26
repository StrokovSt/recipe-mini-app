import clsx from "clsx";
import { AnimatePresence, m } from "motion/react";
import { useSyncExternalStore } from "react";
import { Link, useLocation } from "react-router-dom";

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

// Короткое уведомление, например «Рецепт распознан · Открыть» или «Шаг удалён · Вернуть». Показывается через showToast
export function Toast(props: ToastProps) {
    const { className } = props;
    const toast = useSyncExternalStore(subscribeToast, getToast);
    const { pathname } = useLocation();
    const isShown = toast !== null && (!toast.path || toast.path === pathname);
    const action = toast?.action;

    return (
        <AnimatePresence>
            {isShown && (
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
                    {action && ("to" in action ? (
                        <Link to={action.to} state={action.state} className={styles.action} onClick={hideToast}>
                            {action.label}
                        </Link>
                    ) : (
                        <button
                            type="button"
                            className={styles.action}
                            onClick={() => {
                                action.onClick();
                                hideToast();
                            }}
                        >
                            {action.label}
                        </button>
                    ))}
                </m.div>
            )}
        </AnimatePresence>
    );
}
