import type { RecipeFormValues } from "./schema";

export interface RecipeFormProps {
    defaultValues?: Partial<RecipeFormValues>;
    submitLabel?: string;
    onResetRef?: React.MutableRefObject<((values: Partial<RecipeFormValues>) => void) | null>;
}