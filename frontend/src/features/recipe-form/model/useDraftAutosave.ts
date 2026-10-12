import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import type { UseFormReturn } from "react-hook-form";

import { DRAFT_KEYS, draftApi } from "@/entities/draft";

import type { RecipeFormValues } from "./schema";
import type { RecipeDraftData, RecipeFormDraft, RecipeFormSource } from "./types";

// Сохраняем через секунду после последней правки
const AUTOSAVE_DELAY = 1000;

export type DraftStatus = "idle" | "saving" | "saved" | "error";

interface DraftAutosaveOptions {
    form: UseFormReturn<RecipeFormValues>;
    // Без черновика (редактирование готового рецепта) автосохранение выключено
    draft?: RecipeFormDraft;
    source?: RecipeFormSource;
}

// Автосохранение формы в черновик. Первое изменение создаёт черновик, дальше он обновляется.
// Запросы идут строго по очереди, чтобы черновик не создался дважды
export function useDraftAutosave({ form, draft, source }: DraftAutosaveOptions) {
    const queryClient = useQueryClient();
    const [status, setStatus] = useState<DraftStatus>(draft?.id ? "saved" : "idle");

    const draftIdRef = useRef(draft?.id);
    const queueRef = useRef<Promise<void>>(Promise.resolve());
    const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
    const hasChangesRef = useRef(false);
    const isPausedRef = useRef(false);

    const saveNow = async () => {
        if (!draft || isPausedRef.current || !hasChangesRef.current) return;
        hasChangesRef.current = false;

        const values = form.getValues();
        const data: RecipeDraftData = { values, sourceUrl: source?.sourceUrl ?? "" };
        const title = values.title.trim();

        setStatus("saving");

        try {
            if (draftIdRef.current) {
                await draftApi.update(draftIdRef.current, { title, data });
            }
            else {
                const created = await draftApi.create({ title, origin: draft.origin, source: source?.source, data });
                draftIdRef.current = created.id;
            }

            setStatus(hasChangesRef.current ? "saving" : "saved");
            queryClient.invalidateQueries({ queryKey: DRAFT_KEYS.lists() });
        }
        catch {
            setStatus("error");
        }
    };

    const save = () => {
        clearTimeout(timerRef.current);
        queueRef.current = queueRef.current.then(saveNow);
        return queueRef.current;
    };

    // Подписка один раз: форма и черновик для страницы не меняются.
    // При уходе со страницы и сворачивании приложения досохраняем последние правки
    useEffect(() => {
        if (!draft) return;

        const subscription = form.watch(() => {
            hasChangesRef.current = true;
            clearTimeout(timerRef.current);
            timerRef.current = setTimeout(save, AUTOSAVE_DELAY);
        });

        const handleVisibilityChange = () => {
            if (document.visibilityState === "hidden") save();
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);

        return () => {
            subscription.unsubscribe();
            document.removeEventListener("visibilitychange", handleVisibilityChange);
            save();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Перед сохранением рецепта: дожидаемся очереди и отдаём id черновика, чтобы бэкенд его удалил
    const pause = async () => {
        clearTimeout(timerRef.current);
        isPausedRef.current = true;
        await queueRef.current;
        return draftIdRef.current;
    };

    // «Удалить черновик» при уходе: больше не сохраняем и удаляем то, что успело сохраниться
    const discard = async () => {
        const draftId = await pause();
        if (!draftId) return;

        try {
            await draftApi.delete(draftId);
            queryClient.invalidateQueries({ queryKey: DRAFT_KEYS.lists() });
        }
        catch {
            // Не удалился — останется в списке черновиков, удалить можно там
        }
    };

    // Рецепт не сохранился: снова сохраняем правки в черновик
    const resume = () => {
        isPausedRef.current = false;
    };

    return { status, pause, resume, discard };
}
