import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from "@headlessui/react";
import clsx from "clsx";
import { type ReactNode } from "react";

import { IconButton } from "@/shared/ui/Buttons";

import styles from "./Modal.module.scss";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    children?: ReactNode;
    title?: string;
    footer?: ReactNode;
    className?: string;
}

// Окно по центру экрана, фон как у шторки; закрывается по клику вне окна и по Esc
export const Modal = (props: ModalProps) => {
    const { isOpen, onClose, children, title, footer, className } = props;

    return (
        <Dialog open={isOpen} onClose={onClose} className={styles.root}>
            <DialogBackdrop transition className={styles.backdrop} />

            <div className={styles.container}>
                <DialogPanel transition className={clsx(styles.panel, className)}>
                    <IconButton
                        icon="close"
                        round
                        className={styles.close}
                        onClick={onClose}
                        aria-label="Закрыть"
                    />

                    {title && <DialogTitle className={styles.title}>{title}</DialogTitle>}

                    {children && <div className={styles.content}>{children}</div>}

                    {footer && <footer className={styles.footer}>{footer}</footer>}
                </DialogPanel>
            </div>
        </Dialog>
    );
};
