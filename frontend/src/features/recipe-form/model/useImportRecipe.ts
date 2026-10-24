import { useMutation, useMutationState, useQueryClient } from "@tanstack/react-query";
import i18next from "i18next";
import { useEffect, useRef } from "react";

import type { ParsedRecipe } from "@recipe/common";

import { AppRoute } from "@/app/router";
import { buildRoute } from "@/app/router/routes";
import { DRAFT_KEYS, draftApi } from "@/entities/draft";
import { recipeApi } from "@/entities/recipe";
import { showToast } from "@/shared/ui/Toast";

import { parsedToFormValues } from "./parsed";
import type { RecipeDraftData, RecipeDraftState } from "./types";

// Что распознаём: ссылку или фото
export type ImportSource = { url: string } | { file: File };

// Итог: черновик на сервере или, если сохранить его не вышло, сам распознанный рецепт
export type ImportResult = { draftId: string } | { parsed: ParsedRecipe };

const IMPORT_KEY = ["recipe-import"] as const;

// Распознанное сразу сохраняем в черновик, чтобы оно не пропало
const importRecipe = async (source: ImportSource): Promise<ImportResult> => {
    const parsed = "file" in source ? await recipeApi.parseFromImage(source.file) : await recipeApi.parse(source.url);

    try {
        const data: RecipeDraftData = { values: parsedToFormValues(parsed), sourceUrl: parsed.sourceUrl };
        const draft = await draftApi.create({ title: parsed.title, origin: "ai", source: parsed.source, data });
        return { draftId: draft.id };
    }
    catch {
        return { parsed };
    }
};

// Куда открыть результат: в черновик или, если он не сохранился, в форму с распознанным рецептом
export const getImportRoute = (result: ImportResult): { to: string; state: RecipeDraftState } =>
    "draftId" in result
        ? { to: buildRoute.draft(result.draftId), state: { isImported: true } }
        : { to: AppRoute.CreateRecipe, state: { parsed: result.parsed } };

// Распознавание не зависит от страницы: с неё можно уйти, рецепт всё равно ляжет в черновики.
// Пока страница открыта, результат открывает она сама (onSuccess в mutate), ушли — сообщаем уведомлением
export function useImportRecipe() {
    const queryClient = useQueryClient();
    const isPageOpenRef = useRef(true);

    // Effect: только так узнать, что страницу закрыли, пока рецепт распознаётся
    useEffect(() => {
        isPageOpenRef.current = true;
        return () => {
            isPageOpenRef.current = false;
        };
    }, []);

    return useMutation({
        mutationKey: IMPORT_KEY,
        mutationFn: importRecipe,
        onSuccess: (result) => {
            queryClient.invalidateQueries({ queryKey: DRAFT_KEYS.lists() });
            if (isPageOpenRef.current) return;

            showToast({
                text: i18next.t("recipeForm:import.done"),
                action: { label: i18next.t("recipeForm:import.open"), ...getImportRoute(result) },
            });
        },
        onError: () => {
            if (!isPageOpenRef.current) showToast({ text: i18next.t("recipeForm:import.failed") });
        },
    });
}

// Распознавания, которые идут прямо сейчас (на /add они видны над черновиками)
export const useImportsInProgress = () =>
    useMutationState({
        filters: { mutationKey: IMPORT_KEY, status: "pending" },
        select: (mutation) => ({ id: mutation.mutationId, source: mutation.state.variables as ImportSource }),
    });
