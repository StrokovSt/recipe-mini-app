import { Controller, useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { InputController, TextareaController } from "@/shared/ui/Input";

import type { RecipeFormValues } from "../../model/schema";
import CategorySelect from "../CategorySelect/CategorySelect";
import FormSection from "../FormSection/FormSection";
import TagsSelect from "../TagsSelect/TagsSelect";

import styles from "./MainFields.module.scss";

// Секция «Основное»: название, описание, порции и время готовки, категория, теги
const MainFields = () => {
    const { t } = useTranslation("recipeForm");
    const { control } = useFormContext<RecipeFormValues>();

    return (
        <FormSection mark="二" title={t("sections.main")}>
            <InputController name="title" control={control} label={t("recipe.title")} />
            <TextareaController name="description" control={control} label={t("recipe.description")} />

            <div className={styles.numbers}>
                <InputController
                    name="servings"
                    control={control}
                    label={t("recipe.servings")}
                    type="number"
                    suffix={t("recipe.servingsSuffix")}
                />
                <InputController
                    name="cookTime"
                    control={control}
                    label={t("recipe.cookTime")}
                    type="number"
                    suffix={t("recipe.timeSuffix")}
                />
            </div>

            <h3 className={styles.label}>{t("recipe.category")}</h3>
            <Controller
                control={control}
                name="categoryId"
                render={({ field }) => (
                    <CategorySelect value={field.value ?? null} onChange={field.onChange} />
                )}
            />

            <h3 className={styles.label}>{t("tags")}</h3>
            <Controller
                control={control}
                name="tagIds"
                render={({ field }) => (
                    <TagsSelect value={field.value} onChange={field.onChange} />
                )}
            />
        </FormSection>
    );
};

export default MainFields;
