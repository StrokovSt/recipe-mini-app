import { useFormContext } from "react-hook-form";

import { AddButton, IconButton } from "@/shared/ui/Buttons";
import { TextareaController } from "@/shared/ui/Input";

import type { RecipeFormValues } from "../../model/schema";
import FieldsetWrapper from "../FieldsetWrapper/FieldsetWrapper";

import styles from "./StepsField.module.scss";

const StepsField = () => {
    const { control, watch, setValue, formState: { errors } } = useFormContext<RecipeFormValues>();
    const steps = watch("steps");

    const append = () => {
        setValue("steps", [...steps, ""], { shouldValidate: true });
    };

    const remove = (i: number) => {
        setValue("steps", steps.filter((_, idx) => idx !== i), { shouldValidate: true });
    };

    return (
        <FieldsetWrapper legend="Шаги приготовления">
            {steps.length > 0 && (
                <div className={styles.list}>
                    {steps.map((_, i) => (
                        <div key={i} className={styles.row}>
                            <TextareaController
                                name={`steps.${i}` as "steps.0"}
                                control={control}
                                label={`Шаг ${i + 1}`}
                                error={(errors.steps?.[i] as { message?: string })?.message}
                            />
                            <IconButton icon="close" variant="danger" type="button" onClick={() => remove(i)} />
                        </div>
                    ))}
                </div>
            )}
            {(errors.steps?.message || errors.steps?.root?.message) && (
                <span className={styles.error}>
                    {errors.steps.message ?? errors.steps.root?.message}
                </span>
            )}
            <AddButton label="Добавить шаг" onClick={append} />
        </FieldsetWrapper>
    );
};

export default StepsField;