import { Controller, useFieldArray, useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { AddButton, IconButton } from "@/shared/ui/Buttons";
import { Input } from "@/shared/ui/Input";

import { EMPTY_INGREDIENT, type RecipeFormValues } from "../../model/schema";
import AmountInput from "../AmountInput/AmountInput";
import UnitSelect from "../UnitSelect/UnitSelect";

import styles from "./IngredientsField.module.scss";

interface GroupItemsProps {
    groupIndex: number;
}

// Строки ингредиентов группы: название, количество, единица и удаление
const GroupItems = ({ groupIndex }: GroupItemsProps) => {
    const { t } = useTranslation("recipeForm");
    const { control, register, formState: { errors } } = useFormContext<RecipeFormValues>();
    const { fields, append, remove } = useFieldArray({ control, name: `ingredients.${groupIndex}.items` });
    const itemErrors = errors.ingredients?.[groupIndex]?.items;

    return (
        <>
            <ul className={styles.list}>
                {fields.map((field, index) => (
                    <li key={field.id} className={styles.row}>
                        <Input
                            register={register(`ingredients.${groupIndex}.items.${index}.name`)}
                            label={t("ingredients.name")}
                            error={itemErrors?.[index]?.name?.message}
                            className={styles.name}
                        />
                        <Controller
                            control={control}
                            name={`ingredients.${groupIndex}.items.${index}.amount`}
                            render={({ field: amount, fieldState }) => (
                                <AmountInput
                                    value={amount.value}
                                    onChange={amount.onChange}
                                    onBlur={amount.onBlur}
                                    label={t("ingredients.amount")}
                                    className={styles.amount}
                                    error={fieldState.error?.message}
                                />
                            )}
                        />
                        <Controller
                            control={control}
                            name={`ingredients.${groupIndex}.items.${index}.unit`}
                            render={({ field: unit }) => (
                                <UnitSelect
                                    value={unit.value}
                                    onChange={unit.onChange}
                                    className={styles.unit}
                                />
                            )}
                        />
                        {fields.length > 1 && (
                            <IconButton
                                icon="close"
                                variant="empty"
                                type="button"
                                className={styles.remove}
                                aria-label={t("ingredients.remove")}
                                onClick={() => remove(index)}
                            />
                        )}
                    </li>
                ))}
            </ul>
            <AddButton label={t("ingredients.add")} onClick={() => append(EMPTY_INGREDIENT)} />
        </>
    );
};

export default GroupItems;
