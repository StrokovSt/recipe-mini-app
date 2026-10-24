import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import clsx from "clsx";
import { type KeyboardEvent, type MouseEvent } from "react";
import { useTranslation } from "react-i18next";

import { useCloseOnBack } from "@/shared/lib/hooks";
import { FULL_IMAGE_WIDTH, getImageUrl } from "@/shared/lib/image";
import { IconButton } from "@/shared/ui/Buttons";

import styles from "./MediaLightbox.module.scss";

interface MediaItem {
    url: string;
    type: "image" | "video";
}

interface MediaLightboxProps {
    isOpen: boolean;
    media: MediaItem[];
    index: number;
    onClose: () => void;
    onChange: (index: number) => void;
}

// Фото или видео на весь экран. Закрывается крестиком, по Esc, по клику мимо картинки
// и системной кнопкой «Назад» на телефоне
const MediaLightbox = (props: MediaLightboxProps) => {
    const { isOpen, media, index, onClose, onChange } = props;
    const { t } = useTranslation();
    const close = useCloseOnBack(isOpen, onClose);

    const current = media[index];
    const hasPrev = index > 0;
    const hasNext = index < media.length - 1;

    // Листаем стрелками: фокус всегда внутри окна (Headless UI), поэтому ловим на самой панели
    const panelKeyDownHandler = (e: KeyboardEvent<HTMLDivElement>) => {
        if (e.key === "ArrowLeft" && hasPrev) onChange(index - 1);
        if (e.key === "ArrowRight" && hasNext) onChange(index + 1);
    };

    // Закрываем только по пустому месту: клики по картинке, видео и кнопкам сюда не считаются
    const panelClickHandler = (e: MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) close();
    };

    return (
        <Dialog open={isOpen} onClose={close} className={styles.root}>
            <DialogBackdrop transition className={styles.backdrop} />

            <DialogPanel
                transition
                className={styles.panel}
                onClick={panelClickHandler}
                onKeyDown={panelKeyDownHandler}
            >
                {current?.type === "video" ? (
                    <video key={current.url} src={current.url} className={styles.media} controls playsInline />
                ) : (
                    current && <img src={getImageUrl(current.url, FULL_IMAGE_WIDTH)} className={styles.media} alt="" />
                )}

                <IconButton
                    icon="close"
                    round
                    type="button"
                    className={styles.close}
                    aria-label={t("close")}
                    onClick={close}
                />

                {hasPrev && (
                    <IconButton
                        icon="back"
                        round
                        type="button"
                        className={clsx(styles.nav, styles.prev)}
                        aria-label={t("prev")}
                        onClick={() => onChange(index - 1)}
                    />
                )}

                {hasNext && (
                    <IconButton
                        icon="forward"
                        round
                        type="button"
                        className={clsx(styles.nav, styles.next)}
                        aria-label={t("next")}
                        onClick={() => onChange(index + 1)}
                    />
                )}

                {media.length > 1 && (
                    <div className={styles.dots}>
                        {media.map((item, i) => (
                            <button
                                key={item.url}
                                type="button"
                                className={clsx(styles.dot, i === index && styles.dotActive)}
                                aria-label={String(i + 1)}
                                onClick={() => onChange(i)}
                            />
                        ))}
                    </div>
                )}
            </DialogPanel>
        </Dialog>
    );
};

export default MediaLightbox;
