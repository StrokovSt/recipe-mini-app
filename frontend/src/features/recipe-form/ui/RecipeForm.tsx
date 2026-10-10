import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, FormProvider, type Resolver,useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { AppRoute } from "@/app/router";
import { useCategories } from "@/entities/category";
import { useCreateRecipe } from "@/entities/recipe";
import { OutlineButton, RegularButton } from "@/shared/ui/Buttons";
import { InputController } from "@/shared/ui/Input";
import { SelectController } from "@/shared/ui/Select";

import { EMPTY_INGREDIENT, EMPTY_STEP, type RecipeFormValues, recipeSchema } from "../model/schema";
import type { RecipeFormProps } from "../model/types";
import FieldsetWrapper from "./FieldsetWrapper/FieldsetWrapper";
import IngredientsField from "./IngredientsField/IngredientsField";
import MediaField from "./MediaField/MediaField";
import StepsField from "./StepsField/StepsField";
import TagsSelect from "./TagsSelect/TagsSelect";

import styles from "./RecipeForm.module.scss";

const RecipeForm = (props: RecipeFormProps) => {
    const { t } = useTranslation(["recipeForm", "common"]);
    const {defaultValues, submitLabel = t("common:save"), onSubmit: onSubmitProp, isPending: isPendingProp} = props;
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
            ...defaultValues,
        },
    });

    const { handleSubmit, control, reset } = methods;
    const { data: categories = [] } = useCategories();

    const categoryOptions = [
        ...categories.map((cat) => ({ value: cat.id, label: cat.name })),
    ];

    const { mutate: createRecipe, isPending: isSaving } = useCreateRecipe();
    const isPending = isPendingProp ?? isSaving;

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
                media: values.media,
            },
            { onSuccess: () => navigate(AppRoute.Home) }
        );
    };

    const handleReset = () => {
        reset({
            title: "",
            categoryId: null,
            ingredients: [{ title: null, items: [EMPTY_INGREDIENT] }],
            steps: [],
            cookTime: null,
            servings: null,
            tagIds: [],
        });
    };

    return (
        <FormProvider {...methods}>
            <form className={styles.form} onSubmit={handleSubmit(handleSave, (errors) => console.log('Validation errors:', errors))}>
                <FieldsetWrapper legend={t("recipe.legend")}>
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
                </FieldsetWrapper>

                <IngredientsField />

                <StepsField />

                <MediaField />

                <FieldsetWrapper legend={t("tags")}>
                    <Controller
                        control={control}
                        name="tagIds"
                        render={({ field }) => (
                            <TagsSelect value={field.value} onChange={field.onChange} />
                        )}
                    />
                </FieldsetWrapper>

                <div className={styles.actions}>
                    <OutlineButton
                        className={styles.saveButton}
                        type="button"
                        label={t("reset")}
                        disabled={isPending}
                        onClick={handleReset}
                    />
                    <RegularButton
                        className={styles.saveButton}
                        type="submit"
                        label={submitLabel}
                        disabled={isPending}
                        icon="save"
                    />
                </div>
            </form>
        </FormProvider>
    );
};

export default RecipeForm;