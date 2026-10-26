import AddIcon from "@/shared/assets/icons/icon-add.svg?react";
import BackIcon from "@/shared/assets/icons/icon-back.svg?react";
import BurgerIcon from "@/shared/assets/icons/icon-burger.svg?react";
import CheckIcon from "@/shared/assets/icons/icon-check.svg?react";
import CloseIcon from "@/shared/assets/icons/icon-close.svg?react";
import DeleteIcon from "@/shared/assets/icons/icon-delete.svg?react";
import EditIcon from "@/shared/assets/icons/icon-edit.svg?react";
import FilterIcon from "@/shared/assets/icons/icon-filter.svg?react";
import ForwardIcon from "@/shared/assets/icons/icon-forward.svg?react";
import LinkIcon from "@/shared/assets/icons/icon-link.svg?react";
import MinusIcon from "@/shared/assets/icons/icon-minus.svg?react";
import MoreIcon from "@/shared/assets/icons/icon-more.svg?react";
import SaveIcon from "@/shared/assets/icons/icon-save.svg?react";
import ShareIcon from "@/shared/assets/icons/icon-share.svg?react";
import UserIcon from "@/shared/assets/icons/icon-user.svg?react";

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
    minus: (
        <MinusIcon />
    ),
    edit: (
        <EditIcon />
    ),
    check: (
        <CheckIcon />
    ),
    burger: (
        <BurgerIcon />
    ),
    close: (
        <CloseIcon />
    ),
    filter: (
        <FilterIcon />
    ),
    user: (
        <UserIcon />
    ),
    more: (
        <MoreIcon />
    ),
    share: (
        <ShareIcon />
    ),
    link: (
        <LinkIcon />
    ),
} as const;

export type ButtonIconName = keyof typeof ButtonIcons;