import { BottomSheet } from "@/shared/ui/BottomSheet";
import { OutlineButton, RegularButton } from "@/shared/ui/Buttons";

import styles from "./LeaveSheet.module.scss";

export interface LeaveAction {
    label: string;
    onClick: () => void;
    // primary — главная кнопка, danger — красная обводка, остальные обычные
    variant?: "primary" | "danger";
}

interface LeaveSheetProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    text: string;
    actions: LeaveAction[];
}

// Шторка при уходе с изменённой формы: действия столбиком, главное сверху
const LeaveSheet = (props: LeaveSheetProps) => {
    const { isOpen, onClose, title, text, actions } = props;

    return (
        <BottomSheet isOpen={isOpen} onClose={onClose} title={title} closeOnBack={false}>
            <p className={styles.text}>{text}</p>
            <div className={styles.actions}>
                {actions.map(({ label, onClick, variant }) =>
                    variant === "primary"
                        ? <RegularButton key={label} type="button" label={label} onClick={onClick} />
                        : (
                            <OutlineButton
                                key={label}
                                type="button"
                                label={label}
                                className={variant === "danger" ? styles.danger : undefined}
                                onClick={onClick}
                            />
                        )
                )}
            </div>
        </BottomSheet>
    );
};

export default LeaveSheet;
