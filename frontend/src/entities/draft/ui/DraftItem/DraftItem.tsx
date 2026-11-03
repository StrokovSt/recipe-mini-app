import { memo } from "react";
import { useTranslation } from "react-i18next";

import type { DraftSummary } from "@recipe/common";

import DeleteIcon from "@/shared/assets/icons/icon-delete.svg?react";
import FormIcon from "@/shared/assets/icons/icon-form.svg?react";
import ImageIcon from "@/shared/assets/icons/icon-image.svg?react";
import { useLayoutMode } from "@/shared/lib/layout";
import { Tile } from "@/shared/ui/Tile";

import styles from "./DraftItem.module.scss";

interface DraftItemProps {
    draft: DraftSummary;
    // Куда ведёт плитка
    to: string;
    onDelete: (draft: DraftSummary) => void;
}

const DraftItem = (props: DraftItemProps) => {
    const { draft, to, onDelete } = props;
    const { t, i18n } = useTranslation(["recipeForm", "common"]);
    const mode = useLayoutMode();
    const isDesktop = mode === "desktop" || mode === "wide";
    const title = draft.title || t("drafts.untitled");

    // Сегодняшний черновик подписываем временем, остальные датой
    const updatedAt = new Date(draft.updatedAt);
    const isToday = updatedAt.toDateString() === new Date().toDateString();
    const subtitle = new Intl.DateTimeFormat(
        i18n.language,
        isToday ? { hour: "2-digit", minute: "2-digit" } : { day: "numeric", month: "short" },
    ).format(updatedAt);

    return (
        <Tile
            icon={draft.origin === "ai" ? <ImageIcon /> : <FormIcon />}
            title={title}
            subtitle={subtitle}
            to={to}
            // На компьютере черновики — листки в сетке: иконка сверху, название, дата
            row={!isDesktop}
            className={styles.draft}
            menuLabel={t("drafts.actions", { name: title })}
            menu={[
                { label: t("common:delete"), icon: <DeleteIcon />, danger: true, onClick: () => onDelete(draft) },
            ]}
        />
    );
};

export default memo(DraftItem);
