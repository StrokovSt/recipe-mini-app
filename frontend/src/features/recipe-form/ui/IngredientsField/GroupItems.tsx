import { useFormContext } from "react-hook-form";

import { AddButton, IconButton } from "@/shared/ui/Buttons";
import { InputController } from "@/shared/ui/Input";

import type { RecipeFormValues } from "../../model/schema";

import styles from "./IngredientsField.module.scss";

interface GroupItemsProps {
    groupIndex: number;
}

const GroupItems = ({ groupIndex }: GroupItemsProps) => {
    const { control, watch, setValue, formState: { errors } } = useFormContext<RecipeFormValues>();
    const items = watch(`ingredients.${groupIndex}.items`);

    const append = () => {
        setValue(`ingredients.${groupIndex}.items`, [...items, ""], { shouldValidate: true });
    };

    const remove = (i: number) => {
        setValue(
            `ingredients.${groupIndex}.items`,
            items.filter((_, idx) => idx !== i),
            { shouldValidate: true }
        );
    };

    return (
        <>
            <ul className={styles.list}>
                {items.map((_, i) => (
                    <li key={i} className={styles.row}>
                        <InputController
                            name={`ingredients.${groupIndex}.items.${i}` as "ingredients.0.items.0"}
                            control={control}
                            label={`Ингредиент ${i + 1}`}
                            error={(errors.ingredients?.[groupIndex]?.items?.[i] as { message?: string })?.message}
                        />
                        {items.length > 1 && (
                            <IconButton icon="close" variant="danger" type="button" onClick={() => remove(i)} />
                        )}
                    </li>
                ))}
            </ul>
            <AddButton label="Добавить ингредиент" onClick={append} />
        </>
    );
};

export default GroupItems;