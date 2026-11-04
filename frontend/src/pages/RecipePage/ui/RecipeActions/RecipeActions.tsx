import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import type { Recipe } from "@recipe/common";

import { AppRoute } from "@/app/router";
import { buildRoute } from "@/app/router/routes";
import { useDeleteRecipe } from "@/entities/recipe";
import CheckIcon from "@/shared/assets/icons/icon-check.svg?react";
import DeleteIcon from "@/shared/assets/icons/icon-delete.svg?react";
import EditIcon from "@/shared/assets/icons/icon-edit.svg?react";
import ShareIcon from "@/shared/assets/icons/icon-share.svg?react";
import { shareLink } from "@/shared/lib/share";
import { OutlineButton } from "@/shared/ui/Buttons";
import { ConfirmModal } from "@/shared/ui/Modal";

import styles from "./RecipeActions.module.scss";

// Сколько висит галочка «Ссылка скопирована» на кнопке «Поделиться»
const COPIED_HINT_MS = 2000;

interface RecipeActionsProps {
    recipe: Pick<Recipe, "id" | "title" | "telegraphUrl">;
}

// Кнопки рецепта на виду: поделиться, изменить, удалить
export function RecipeActions({ recipe }: RecipeActionsProps) {
    const { t } = useTranslation(["recipe", "common"]);
    const navigate = useNavigate();
    const { mutate: deleteRecipe } = useDeleteRecipe();
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [isLinkCopied, setIsLinkCopied] = useState(false);

    // Делимся публичной Telegraph-страницей: сам рецепт в приложении видит только автор
    const handleShare = async () => {
        if (!recipe.telegraphUrl) return;

        const result = await shareLink(recipe.telegraphUrl, recipe.title);
        if (result === "copied") {
            setIsLinkCopied(true);
            setTimeout(() => setIsLinkCopied(false), COPIED_HINT_MS);
        }
    };

    const handleDelete = () => {
        deleteRecipe(recipe.id, { onSuccess: () => navigate(AppRoute.Home) });
    };

    return (
        <div className={styles.actions}>
            {recipe.telegraphUrl && (
                <OutlineButton type="button" label={t("share")} className={styles.button} onClick={handleShare}>
                    {isLinkCopied ? <CheckIcon /> : <ShareIcon />}
                    {t(isLinkCopied ? "shareCopied" : "share")}
                </OutlineButton>
            )}
            <OutlineButton
                type="button"
                label={t("common:edit")}
                className={styles.button}
                onClick={() => navigate(buildRoute.editRecipe(recipe.id))}
            >
                <EditIcon />
                {t("common:edit")}
            </OutlineButton>
            <OutlineButton
                type="button"
                label={t("common:delete")}
                className={styles.danger}
                onClick={() => setIsConfirmOpen(true)}
            >
                <DeleteIcon />
                {t("common:delete")}
            </OutlineButton>

            <ConfirmModal
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                onConfirm={handleDelete}
                title={t("deleteTitle", { title: recipe.title })}
                text={t("deleteText")}
            />
        </div>
    );
}
