import { useFieldArray, useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { AddButton, IconButton } from "@/shared/ui/Buttons";
import { InputController } from "@/shared/ui/Input";

import { EMPTY_INGREDIENT, type RecipeFormValues } from "../../model/schema";
import FieldsetWrapper from "../FieldsetWrapper/FieldsetWrapper";
import GroupItems from "./GroupItems";

import styles from "./IngredientsField.module.scss";

const IngredientsField = () => {
    const { t } = useTranslation("recipeForm");
    const { control, formState: { errors } } = useFormContext<RecipeFormValues>();
    const { fields: groups, append: appendGroup, remove: removeGroup } = useFieldArray({
        control,
        name: "ingredients",
    });

    return (
        <FieldsetWrapper legend={t("ingredients.legend")}>
            {groups.map((group, gi) => (
                <div key={group.id} className={styles.group}>
                    <div className={styles.groupHeader}>
                        <InputController
                            name={`ingredients.${gi}.title` as "ingredients.0.title"}
                            control={control}
                            label={t("ingredients.groupTitle")}
                        />
                        {groups.length > 1 && (
                            <IconButton icon="close" variant="danger" type="button" onClick={() => removeGroup(gi)} />
                        )}
                    </div>
                    <GroupItems groupIndex={gi} />
                </div>
            ))}

            {errors.ingredients && (
                <span className={styles.error}>{errors.ingredients.message}</span>
            )}

            <AddButton
                label={t("ingredients.addGroup")}
                onClick={() => appendGroup({ title: null, items: [EMPTY_INGREDIENT] })}
            />
        </FieldsetWrapper>
    );
};

export default IngredientsField;