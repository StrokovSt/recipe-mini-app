import { Controller, useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { NUTRITION_FIELDS } from "../../model/constants";
import type { RecipeFormValues } from "../../model/schema";

import styles from "./NutritionFields.module.scss";

interface NutritionFieldsProps {
    id?: string;
}

// КБЖУ на порцию плитками в ряд. Подпись («ккал», «белки, г») работает как у обычного поля, только наоборот:
// в пустой плитке стоит посередине, при вводе уезжает вниз, под число. Вводятся только цифры
const NutritionFields = ({ id }: NutritionFieldsProps) => {
    const { t } = useTranslation(["recipeForm", "recipe"]);
    const { control } = useFormContext<RecipeFormValues>();

    return (
        <div id={id} className={styles.grid}>
            {NUTRITION_FIELDS.map((name) => {
                const unit = t(name === "calories" ? "recipe.caloriesSuffix" : "recipe.gramsSuffix");
                const caption = name === "calories" ? unit : `${t(`recipe:nutrition.${name}`)}, ${unit}`;

                return (
                    <Controller
                        key={name}
                        control={control}
                        name={name}
                        render={({ field }) => (
                            <label className={styles.tile}>
                                <input
                                    ref={field.ref}
                                    className={styles.input}
                                    inputMode="numeric"
                                    placeholder=" "
                                    autoComplete="off"
                                    aria-label={`${t(`recipe.${name}`)}, ${unit}`}
                                    value={field.value ?? ""}
                                    onChange={(event) => {
                                        const digits = event.target.value.replace(/\D/g, "");
                                        field.onChange(digits === "" ? null : Number(digits));
                                    }}
                                    onBlur={field.onBlur}
                                />
                                <span className={styles.caption} aria-hidden>{caption}</span>
                            </label>
                        )}
                    />
                );
            })}
        </div>
    );
};

export default NutritionFields;
