import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import clsx from "clsx";
import { useEffect, useId, useRef, useState } from "react";
import { Controller, type FieldErrors, FormProvider, type Resolver, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useBlocker, useNavigate } from "react-router-dom";

import { AppRoute } from "@/app/router";
import { DRAFT_KEYS } from "@/entities/draft";
import { useCreateRecipe, useUploadMedia } from "@/entities/recipe";
import { ApiError } from "@/shared/api";
import { getAnimations } from "@/shared/lib/animations";
import { getErrorMessage } from "@/shared/lib/errors";
import { IconButton, RegularButton } from "@/shared/ui/Buttons";
import { ImageInput } from "@/shared/ui/ImageInput";
import { Modal } from "@/shared/ui/Modal";
import { PageFooter } from "@/shared/ui/PageFooter";
import { PageHeader } from "@/shared/ui/PageHeader";

import { toMedia } from "../model/cover";
import { dropEmptyRows, EMPTY_FORM_VALUES, type RecipeFormValues, recipeSchema } from "../model/schema";
import type { ContentTab, RecipeFormProps } from "../model/types";
import { useDraftAutosave } from "../model/useDraftAutosave";
import ContentFields from "./ContentFields/ContentFields";
import FormSection from "./FormSection/FormSection";
import LeaveSheet, { type LeaveAction } from "./LeaveSheet/LeaveSheet";
import MainFields from "./MainFields/MainFields";

import styles from "./RecipeForm.module.scss";

const RecipeForm = (props: RecipeFormProps) => {
    const { t } = useTranslation(["recipeForm", "common"]);
    const {
        title,
        subtitle,
        defaultValues,
        submitLabel = t("common:save"),
        onSubmit: onSubmitProp,
        isPending: isPendingProp,
        source,
        draft,
    } = props;
    const navigate = useNavigate();
    const methods = useForm<RecipeFormValues>({
        resolver: zodResolver(recipeSchema) as Resolver<RecipeFormValues>,
        // Фокус сразу открыл бы клавиатуру и сбил прокрутку, к ошибке ведём сами
        shouldFocusError: false,
        defaultValues: { ...EMPTY_FORM_VALUES, ...defaultValues },
    });

    const { handleSubmit, control, formState: { submitCount, isDirty } } = methods;
    const formRef = useRef<HTMLFormElement>(null);
    // Кнопка сохранения в футере, вне формы: связана с ней через атрибут form
    const formId = useId();
    const [contentTab, setContentTab] = useState<ContentTab>("ingredients");

    // Не сохранилось из-за ошибок: прокручиваем к самой верхней, как по якорю
    useEffect(() => {
        if (submitCount === 0) return;

        const invalid = formRef.current?.querySelector('[aria-invalid="true"], [role="alert"]');
        invalid?.scrollIntoView({ behavior: getAnimations() ? "smooth" : "auto", block: "center" });
    }, [submitCount]);

    const queryClient = useQueryClient();
    const autosave = useDraftAutosave({ form: methods, draft, source });

    const { mutate: createRecipe, isPending: isSaving } = useCreateRecipe();
    const { mutateAsync: uploadMedia } = useUploadMedia();
    const isPending = isPendingProp ?? isSaving;
    // Рецепт не сохранился (лимит рецептов, нет сети): объясняем в окне. Текст отдельно от isOpen,
    // чтобы он не сменился, пока окно закрывается
    const [saveError, setSaveError] = useState({ isOpen: false, message: "" });

    const uploadCover = async (file: File) => (await uploadMedia(file)).url;

    // Уход с изменённой формы (или из только что импортированного черновика) спрашиваем в шторке.
    // Не спрашиваем, когда рецепт сохраняется или пользователь уже выбрал действие в шторке
    const isLeavingRef = useRef(false);
    const blocker = useBlocker(({ currentLocation, nextLocation }) =>
        (isDirty || !!draft?.isImported) && !isLeavingRef.current && currentLocation.pathname !== nextLocation.pathname
    );

    // Сохранение не удалось: снова спрашиваем при уходе
    useEffect(() => {
        if (!isPending) isLeavingRef.current = false;
    }, [isPending]);

    const leave = () => {
        isLeavingRef.current = true;
        blocker.proceed?.();
    };

    const stay = () => blocker.reset?.();

    const leaveActions: LeaveAction[] = draft
        ? [
            { label: t("leave.draft.keep"), variant: "primary", onClick: leave },
            {
                label: t("leave.draft.delete"),
                variant: "danger",
                onClick: async () => {
                    isLeavingRef.current = true;
                    await autosave.discard();
                    leave();
                },
            },
            { label: t("leave.draft.continue"), onClick: stay },
        ]
        : [
            {
                label: t("leave.edit.save"),
                variant: "primary",
                onClick: () => {
                    stay();
                    submit();
                },
            },
            { label: t("leave.edit.discard"), variant: "danger", onClick: leave },
            { label: t("common:cancel"), onClick: stay },
        ];

    const handleSave = async (formValues: RecipeFormValues) => {
        const values = dropEmptyRows(formValues);
        isLeavingRef.current = true;

        if (onSubmitProp) {
            onSubmitProp(values);
            return;
        }

        const draftId = await autosave.pause();

        createRecipe(
            {
                title: values.title,
                description: values.description?.trim() || null,
                categoryId: values.categoryId,
                ingredients: values.ingredients,
                steps: values.steps,
                prepTime: values.prepTime ?? null,
                cookTime: values.cookTime ?? null,
                servings: values.servings ?? null,
                calories: values.calories ?? null,
                protein: values.protein ?? null,
                fat: values.fat ?? null,
                carbs: values.carbs ?? null,
                tags: values.tagIds,
                source: source?.source ?? "other",
                sourceUrl: source?.sourceUrl ?? "",
                media: toMedia(values.cover, values.video),
                draftId,
            },
            {
                onSuccess: () => {
                    if (draftId) queryClient.invalidateQueries({ queryKey: DRAFT_KEYS.lists() });
                    navigate(AppRoute.Home);
                },
                onError: (error) => {
                    isLeavingRef.current = false;
                    autosave.resume();
                    setSaveError({
                        isOpen: true,
                        message: getErrorMessage(error instanceof ApiError ? error.code : undefined),
                    });
                },
            }
        );
    };

    // Ошибки только на скрытой вкладке: открываем её, иначе к ошибке не прокрутить
    const handleInvalid = (errors: FieldErrors<RecipeFormValues>) => {
        if (errors[contentTab]) return;
        if (errors.ingredients) setContentTab("ingredients");
        else if (errors.steps) setContentTab("steps");
    };

    const submit = handleSubmit(handleSave, handleInvalid);

    return (
        <FormProvider {...methods}>
            <PageHeader className={styles.header}>
                <div className={styles.heading}>
                    <h1 className={styles.title}>{title}</h1>
                    {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
                </div>
                <IconButton
                    icon="back"
                    round
                    className={styles.back}
                    type="button"
                    aria-label={t("common:back")}
                    onClick={() => navigate(-1)}
                />
            </PageHeader>

            {/* Проверяет схема, а не браузер: иначе недописанная ссылка на обложку (поле type="url")
                останавливала бы сохранение всплывающей подсказкой браузера */}
            <form
                ref={formRef}
                id={formId}
                className={styles.form}
                noValidate
                onSubmit={submit}
            >
                <FormSection mark="一" title={t("sections.cover")}>
                    <Controller
                        control={control}
                        name="cover"
                        render={({ field }) => (
                            <ImageInput
                                value={field.value}
                                onChange={field.onChange}
                                onUpload={uploadCover}
                            />
                        )}
                    />
                </FormSection>

                <MainFields />

                <ContentFields tab={contentTab} onTabChange={setContentTab} />
            </form>

            <PageFooter className={styles.footer}>
                {autosave.status !== "idle" && (
                    <p
                        className={clsx(styles.draftStatus, autosave.status === "error" && styles.draftError)}
                        role="status"
                    >
                        {t(`draftStatus.${autosave.status}`)}
                    </p>
                )}
                <RegularButton
                    className={styles.submit}
                    type="submit"
                    form={formId}
                    label={submitLabel}
                    disabled={isPending}
                />
            </PageFooter>

            <LeaveSheet
                isOpen={blocker.state === "blocked"}
                onClose={stay}
                title={draft ? t("leave.draft.title") : t("leave.edit.title")}
                text={draft ? t("leave.draft.text") : t("leave.edit.text")}
                actions={leaveActions}
            />

            <Modal
                isOpen={saveError.isOpen}
                onClose={() => setSaveError((prev) => ({ ...prev, isOpen: false }))}
                title={t("saveError")}
            >
                <p>{saveError.message}</p>
            </Modal>
        </FormProvider>
    );
};

export default RecipeForm;
