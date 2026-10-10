import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, FormProvider, type Resolver, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { AppRoute } from "@/app/router";
import { useCategories } from "@/entities/category";
import { useCreateRecipe, useUploadMedia } from "@/entities/recipe";
import { IconButton, RegularButton } from "@/shared/ui/Buttons";
import { ImageInput } from "@/shared/ui/ImageInput";
import { InputController } from "@/shared/ui/Input";
import { PageHeader } from "@/shared/ui/PageHeader";
import { SelectController } from "@/shared/ui/Select";

import { toMedia } from "../model/cover";
import { EMPTY_INGREDIENT, EMPTY_STEP, type RecipeFormValues, recipeSchema } from "../model/schema";
import type { RecipeFormProps } from "../model/types";
import FormSection from "./FormSection/FormSection";
import IngredientsField from "./IngredientsField/IngredientsField";
import StepsField from "./StepsField/StepsField";
import TagsSelect from "./TagsSelect/TagsSelect";

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
    } = props;
    const navigate = useNavigate();
    const methods = useForm<RecipeFormValues>({
        resolver: zodResolver(recipeSchema) as Resolver<RecipeFormValues>,
        defaultValues: {
            title: "",
            categoryId: null,
            ingredients: [{ title: null, items: [EMPTY_INGREDIENT] }],
            steps: [EMPTY_STEP],
            cookTime: null,
            servings: null,
            tagIds: [],
            cover: null,
            ...defaultValues,
        },
    });

    const { handleSubmit, control } = methods;
    const { data: categories = [] } = useCategories();

    const categoryOptions = [
        ...categories.map((cat) => ({ value: cat.id, label: cat.name })),
    ];

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
                description: values.description ?? null,
                categoryId: values.categoryId,
                ingredients: values.ingredients,
                steps: values.steps,
                prepTime: values.prepTime ?? null,
                cookTime: values.cookTime ?? null,
                servings: values.servings ?? null,
                tags: values.tagIds,
                source: "other",
                sourceUrl: "",
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

            <form className={styles.form} onSubmit={handleSubmit(handleSave)}>
                <FormSection title={t("sections.cover")}>
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

                <FormSection title={t("sections.main")}>
                    <InputController
                        name="title"
                        control={control}
                        label={t("recipe.title")}
                    />

                    <SelectController
                        name="categoryId"
                        control={control}
                        options={categoryOptions}
                        placeholder={t("recipe.category")}
                    />

                    <InputController
                        name="cookTime"
                        control={control}
                        label={t("recipe.time")}
                        type="number"
                        suffix={t("recipe.timeSuffix")}
                    />

                    <InputController
                        name="servings"
                        control={control}
                        label={t("recipe.servings")}
                        type="number"
                        suffix={t("recipe.servingsSuffix")}
                    />
                </FormSection>

                <FormSection title={t("tags")}>
                    <Controller
                        control={control}
                        name="tagIds"
                        render={({ field }) => (
                            <TagsSelect value={field.value} onChange={field.onChange} />
                        )}
                    />
                </FormSection>

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
