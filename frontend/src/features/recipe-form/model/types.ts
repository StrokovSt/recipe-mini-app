import type { RecipeFormValues } from "./schema";

export interface RecipeFormProps {
    defaultValues?: Partial<RecipeFormValues>;
    submitLabel?: string;
    onSubmit?: (values: RecipeFormValues) => void;
    isPending?: boolean;
}