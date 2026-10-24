import { Description, Dialog, DialogBackdrop, DialogPanel, DialogTitle } from "@headlessui/react";
import clsx from "clsx";
import { animate, m, useMotionValue } from "motion/react";
import { type PointerEvent, type ReactNode, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";

import { TRANSITION_BASE } from "@/shared/config/animation";
import { useCloseOnBack } from "@/shared/lib/hooks";
import { IconButton } from "@/shared/ui/Buttons";

import styles from "./BottomSheet.module.scss";

// Шторка закрывается, если её утянули ниже этого расстояния (px) или смахнули быстрее этой скорости (px/с)
const CLOSE_DISTANCE = 100;
const CLOSE_VELOCITY = 500;

interface BottomSheetProps {
    isOpen: boolean;
    onClose: () => void;
    children: ReactNode;
    title?: string;
    // Курсивная подпись под заголовком
    subtitle?: string;
    // Своё содержимое шапки вместо заголовка и подписи
    header?: ReactNode;
    footer?: ReactNode;
    // Системная «Назад» закрывает шторку. Выключается, где «Назад» уже занята (шторка подтверждения ухода)
    closeOnBack?: boolean;
    className?: string;
}

export const BottomSheet = (props: BottomSheetProps) => {
    const { isOpen, onClose, children, title, subtitle, header, footer, closeOnBack = true, className } = props;
    const { t } = useTranslation();
    const close = useCloseOnBack(isOpen && closeOnBack, onClose);

    const y = useMotionValue(0);
    const startYRef = useRef<number | null>(null);

    useEffect(() => {
        if (isOpen) y.set(0);
    }, [isOpen, y]);

    const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
        event.currentTarget.setPointerCapture(event.pointerId);
        y.stop();
        startYRef.current = event.clientY - y.get();
    };

    const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
        if (startYRef.current === null) return;

        y.set(Math.max(0, event.clientY - startYRef.current));
    };

    const handlePointerUp = () => {
        if (startYRef.current === null) return;
        startYRef.current = null;

        // При закрытии оставляем шторку где отпустили: дальше вниз её уводит переход закрытия
        if (y.get() > CLOSE_DISTANCE || y.getVelocity() > CLOSE_VELOCITY) close();
        else animate(y, 0, TRANSITION_BASE);
    };

    return (
        <Dialog open={isOpen} onClose={close} className={styles.root}>
            <DialogBackdrop transition className={styles.backdrop} />

            <m.div className={styles.container} style={{ y }}>
                <DialogPanel transition className={clsx(styles.panel, className)}>
                    <div
                        className={styles.handle}
                        aria-hidden
                        onPointerDown={handlePointerDown}
                        onPointerMove={handlePointerMove}
                        onPointerUp={handlePointerUp}
                        onPointerCancel={handlePointerUp}
                    />

                    <IconButton
                        icon="close"
                        round
                        className={styles.close}
                        onClick={close}
                        aria-label={t("close")}
                    />

                    {(header || title) && (
                        <header className={styles.header}>
                            {header ?? (
                                <>
                                    <DialogTitle className={styles.title}>{title}</DialogTitle>
                                    {subtitle && <Description className={styles.subtitle}>{subtitle}</Description>}
                                </>
                            )}
                        </header>
                    )}

                    <div className={styles.content}>{children}</div>

                    {footer && <footer className={styles.footer}>{footer}</footer>}
                </DialogPanel>
            </m.div>
        </Dialog>
    );
};
