import AddIcon from "@/shared/assets/icons/icon-add.svg?react";
import BackIcon from "@/shared/assets/icons/icon-back.svg?react";
import CheckIcon from "@/shared/assets/icons/icon-check.svg?react";
import CloseIcon from "@/shared/assets/icons/icon-close.svg?react";
import DeleteIcon from "@/shared/assets/icons/icon-delete.svg?react";
import EditIcon from "@/shared/assets/icons/icon-edit.svg?react";
import ForwardIcon from "@/shared/assets/icons/icon-forward.svg?react";
import SaveIcon from "@/shared/assets/icons/icon-save.svg?react";

export const ButtonIcons = {
    save: (
        <SaveIcon />
    ),
    delete: (
        <DeleteIcon />
    ),
    back: (
        <BackIcon />
    ),
    forward: (
        <ForwardIcon />
    ),
    add: (
        <AddIcon />
    ),
    edit: (
        <EditIcon />
    ),
    check: (
        <CheckIcon />
    ),
    close: (
        <CloseIcon />
    )
} as const;

export type ButtonIconName = keyof typeof ButtonIcons;