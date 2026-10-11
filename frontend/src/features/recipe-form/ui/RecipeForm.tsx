import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef } from "react";
import { Controller, FormProvider, type Resolver, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { AppRoute } from "@/app/router";
import { useCreateRecipe, useUploadMedia } from "@/entities/recipe";
import { getAnimations } from "@/shared/lib/animations";
import { IconButton, RegularButton } from "@/shared/ui/Buttons";
import { ImageInput } from "@/shared/ui/ImageInput";
import { PageHeader } from "@/shared/ui/PageHeader";

import { toMedia } from "../model/cover";
import { EMPTY_INGREDIENT, EMPTY_STEP, type RecipeFormValues, recipeSchema } from "../model/schema";
import type { RecipeFormProps } from "../model/types";
import FormSection from "./FormSection/FormSection";
import IngredientsField from "./IngredientsField/IngredientsField";
import MainFields from "./MainFields/MainFields";
import StepsField from "./StepsField/StepsField";

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
    } = props;
    const navigate = useNavigate();
    const methods = useForm<RecipeFormValues>({
        resolver: zodResolver(recipeSchema) as Resolver<RecipeFormValues>,
        // Фокус сразу открыл бы клавиатуру и сбил прокрутку, к ошибке ведём сами
        shouldFocusError: false,
        defaultValues: {
            title: "",
            description: null,
            categoryId: null,
            ingredients: [{ title: null, items: [EMPTY_INGREDIENT] }],
            steps: [EMPTY_STEP],
            prepTime: null,
            cookTime: null,
            servings: null,
            tagIds: [],
            cover: null,
            ...defaultValues,
        },
    });

    const { handleSubmit, control, formState: { submitCount } } = methods;
    const formRef = useRef<HTMLFormElement>(null);

    // Не сохранилось из-за ошибок: прокручиваем к самой верхней, как по якорю
    useEffect(() => {
        if (submitCount === 0) return;

        const invalid = formRef.current?.querySelector('[aria-invalid="true"], [role="alert"]');
        invalid?.scrollIntoView({ behavior: getAnimations() ? "smooth" : "auto", block: "center" });
    }, [submitCount]);

    const { mutate: createRecipe, isPending: isSaving } = useCreateRecipe();
    const { mutateAsync: uploadMedia } = useUploadMedia();
    const isPending = isPendingProp ?? isSaving;

    const uploadCover = async (file: File) => (await uploadMedia(file)).url;

    const handleSave = (values: RecipeFormValues) => {
        if (onSubmitProp) {
            onSubmitProp(values);
            return;
        }

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
                tags: values.tagIds,
                source: source?.source ?? "other",
                sourceUrl: source?.sourceUrl ?? "",
                media: toMedia(values.cover),
            },
            { onSuccess: () => navigate(AppRoute.Home) }
        );
    };

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

            <form ref={formRef} className={styles.form} onSubmit={handleSubmit(handleSave)}>
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

                <IngredientsField />

                <StepsField />

                <div className={styles.save}>
                    <RegularButton
                        className={styles.submit}
                        type="submit"
                        label={submitLabel}
                        disabled={isPending}
                    />
                </div>
            </form>
        </FormProvider>
    );
};

export default RecipeForm;
