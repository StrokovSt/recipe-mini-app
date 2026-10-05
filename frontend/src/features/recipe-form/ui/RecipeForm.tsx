import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, FormProvider, type Resolver,useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

import { AppRoute } from "@/app/router";
import { useCategories } from "@/entities/category";
import { useCreateRecipe } from "@/entities/recipe";
import { RegularButton } from "@/shared/ui/Buttons";
import { InputController } from "@/shared/ui/Input";
import { SelectController } from "@/shared/ui/Select";

import { type RecipeFormValues,recipeSchema } from "../model/schema";
import type { RecipeFormProps } from "../model/types";
import FieldsetWrapper from "./FieldsetWrapper/FieldsetWrapper";
import IngredientsField from "./IngredientsField/IngredientsField";
import MediaField from "./MediaField/MediaField";
import StepsField from "./StepsField/StepsField";
import TagsSelect from "./TagsSelect/TagsSelect";

import styles from "./RecipeForm.module.scss";

const RecipeForm = (props: RecipeFormProps) => {
    const {defaultValues, submitLabel = "Сохранить", onSubmit: onSubmitProp, isPending: isPendingProp} = props;
    const navigate = useNavigate();
    const methods = useForm<RecipeFormValues>({
        resolver: zodResolver(recipeSchema) as Resolver<RecipeFormValues>,
        defaultValues: {
            title: "",
            categoryId: null,
            ingredients: [{ title: null, items: [""] }],
            steps: [""],
            time: null,
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
                categoryId: values.categoryId,
                ingredients: values.ingredients,
                steps: values.steps,
                time: values.time ?? null,
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
            ingredients: [{ title: null, items: [""] }],
            steps: [],
            time: null,
            servings: null,
            tagIds: [],
        });
    };

    return (
        <FormProvider {...methods}>
            <form className={styles.form} onSubmit={handleSubmit(handleSave, (errors) => console.log('Validation errors:', errors))}>
                <FieldsetWrapper legend="Рецепт">
                    <InputController
                        name="title"
                        control={control}
                        label="Название"
                    />

                    <SelectController
                        name="categoryId"
                        control={control}
                        options={categoryOptions}
                        placeholder="Категория"
                    />

                    <InputController
                        name="time"
                        control={control}
                        label="Время приготовления"
                        suffix="мин."
                    />

                    <InputController
                        name="servings"
                        control={control}
                        label="Количество порций"
                        type="number"
                        suffix="шт."
                    />
                </FieldsetWrapper>

                <IngredientsField />

                <StepsField />

                <MediaField />

                <FieldsetWrapper legend="Теги">
                    <Controller
                        control={control}
                        name="tagIds"
                        render={({ field }) => (
                            <TagsSelect value={field.value} onChange={field.onChange} />
                        )}
                    />
                </FieldsetWrapper>

                <div className={styles.actions}>
                    <RegularButton
                        className={styles.saveButton}
                        type="button"
                        label={"Сбросить форму"}
                        disabled={isPending}
                        onClick={handleReset}
                        icon="delete"
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