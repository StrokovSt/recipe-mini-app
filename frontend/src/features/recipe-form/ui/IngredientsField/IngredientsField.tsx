import { useFieldArray, useFormContext } from "react-hook-form";

import { AddButton, IconButton } from "@/shared/ui/Buttons";
import { InputController } from "@/shared/ui/Input";

import type { RecipeFormValues } from "../../model/schema";
import FieldsetWrapper from "../FieldsetWrapper/FieldsetWrapper";
import GroupItems from "./GroupItems";

import styles from "./IngredientsField.module.scss";

const IngredientsField = () => {
    const { control, formState: { errors } } = useFormContext<RecipeFormValues>();
    const { fields: groups, append: appendGroup, remove: removeGroup } = useFieldArray({
        control,
        name: "ingredients",
    });

    return (
        <FieldsetWrapper legend="Ингридиенты">
            {groups.map((group, gi) => (
                <div key={group.id} className={styles.group}>
                    <div className={styles.groupHeader}>
                        <InputController
                            name={`ingredients.${gi}.title` as "ingredients.0.title"}
                            control={control}
                            label="Заголовок группы ингридиентов"
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
                label="Добавить группу"
                onClick={() => appendGroup({ title: null, items: [""] })}
            />
        </FieldsetWrapper>
    );
};

export default IngredientsField;