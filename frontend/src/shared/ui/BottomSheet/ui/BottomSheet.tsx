import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from "@headlessui/react";
import clsx from "clsx";
import { type ReactNode } from "react";

import { IconButton } from "@/shared/ui/Buttons";

import styles from "./BottomSheet.module.scss";

interface BottomSheetProps {
    isOpen: boolean;
    onClose: () => void;
    children: ReactNode;
    title?: string;
    footer?: ReactNode;
    className?: string;
}

export const BottomSheet = (props: BottomSheetProps) => {
    const { isOpen, onClose, children, title, footer, className } = props;

    return (
        <Dialog open={isOpen} onClose={onClose} className={styles.root}>
            <DialogBackdrop transition className={styles.backdrop} />

            <div className={styles.container}>
                <DialogPanel transition className={clsx(styles.panel, className)}>
                    <div className={styles.handle} aria-hidden />

                    <header className={styles.header}>
                        {title && <DialogTitle className={styles.title}>{title}</DialogTitle>}
                        <IconButton
                            icon="close"
                            variant="empty"
                            className={styles.close}
                            onClick={onClose}
                            aria-label="Закрыть"
                        />
                    </header>

                    <div className={styles.content}>{children}</div>

                    {footer && <footer className={styles.footer}>{footer}</footer>}
                </DialogPanel>
            </div>
        </Dialog>
    );
};
