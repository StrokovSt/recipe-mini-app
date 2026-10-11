import { useFieldArray, useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { useUploadMedia } from "@/entities/recipe";
import { AddButton } from "@/shared/ui/Buttons";

import { EMPTY_STEP, type RecipeFormValues } from "../../model/schema";
import FormSection from "../FormSection/FormSection";
import StepItem from "./StepItem";

import styles from "./StepsField.module.scss";

// Секция «Приготовление»: шаги карточками с номером, текстом и фото
const StepsField = () => {
    const { t } = useTranslation("recipeForm");
    const { control, formState: { errors } } = useFormContext<RecipeFormValues>();
    const { fields, append, remove } = useFieldArray({ control, name: "steps" });
    const { mutateAsync: uploadMedia } = useUploadMedia();

    const uploadPhoto = async (file: File) => (await uploadMedia(file)).url;

    return (
        <FormSection
            mark="四"
            title={t("sections.steps")}
            action={<AddButton label={t("steps.add")} onClick={() => append(EMPTY_STEP)} />}
        >
            {fields.length > 0 && (
                <ol className={styles.list}>
                    {fields.map((field, index) => (
                        <StepItem
                            key={field.id}
                            index={index}
                            onUpload={uploadPhoto}
                            onRemove={fields.length > 1 ? () => remove(index) : undefined}
                        />
                    ))}
                </ol>
            )}

            {errors.steps?.message && <p className={styles.error} role="alert">{errors.steps.message}</p>}
        </FormSection>
    );
};

export default StepsField;
