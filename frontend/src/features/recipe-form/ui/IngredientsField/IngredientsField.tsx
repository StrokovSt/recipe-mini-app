import { useFieldArray, useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { AddButton, IconButton } from "@/shared/ui/Buttons";
import { Input } from "@/shared/ui/Input";

import { EMPTY_INGREDIENT, type RecipeFormValues } from "../../model/schema";
import FormSection from "../FormSection/FormSection";
import GroupItems from "./GroupItems";

import styles from "./IngredientsField.module.scss";

// Секция «Ингредиенты»: группы карточками, в каждой название группы и строки ингредиентов
const IngredientsField = () => {
    const { t } = useTranslation("recipeForm");
    const { control, register, formState: { errors } } = useFormContext<RecipeFormValues>();
    const { fields: groups, append, remove } = useFieldArray({ control, name: "ingredients" });

    return (
        <FormSection
            mark="三"
            title={t("sections.ingredients")}
            description={t("sections.optional")}
            action={
                <AddButton
                    label={t("ingredients.addGroup")}
                    onClick={() => append({ title: null, items: [EMPTY_INGREDIENT] })}
                />
            }
        >
            {groups.map((group, groupIndex) => (
                <div key={group.id} className={styles.group}>
                    <div className={styles.groupHeader}>
                        <Input
                            register={register(`ingredients.${groupIndex}.title`)}
                            label={t("ingredients.groupTitle")}
                            className={styles.groupTitle}
                        />
                        {groups.length > 1 && (
                            <IconButton
                                icon="close"
                                variant="empty"
                                type="button"
                                className={styles.remove}
                                aria-label={t("ingredients.removeGroup")}
                                onClick={() => remove(groupIndex)}
                            />
                        )}
                    </div>
                    <GroupItems groupIndex={groupIndex} />
                </div>
            ))}

            {errors.ingredients?.message && <p className={styles.error} role="alert">{errors.ingredients.message}</p>}
        </FormSection>
    );
};

export default IngredientsField;
