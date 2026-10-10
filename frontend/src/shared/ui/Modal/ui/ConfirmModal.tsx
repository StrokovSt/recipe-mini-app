import { useTranslation } from "react-i18next";

import { OutlineButton, RegularButton } from "@/shared/ui/Buttons";

import { Modal } from "./Modal";

import styles from "./Modal.module.scss";

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    text?: string;
    confirmLabel?: string;
}

// Подтверждение опасного действия: «Вы уверены?»
export const ConfirmModal = (props: ConfirmModalProps) => {
    const { t } = useTranslation();
    const { isOpen, onClose, onConfirm, title, text, confirmLabel = t("delete") } = props;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={title}
            footer={
                <>
                    <OutlineButton label={t("cancel")} onClick={onClose} />
                    <RegularButton label={confirmLabel} className={styles.danger} onClick={onConfirm} />
                </>
            }
        >
            {text && <p>{text}</p>}
        </Modal>
    );
};
