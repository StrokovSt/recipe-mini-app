import type { RecipeFormValues } from "./schema";

export interface RecipeFormProps {
    // Заголовок и подзаголовок в шапке страницы
    title: string;
    subtitle?: string;
    defaultValues?: Partial<RecipeFormValues>;
    submitLabel?: string;
    onSubmit?: (values: RecipeFormValues) => void;
    isPending?: boolean;
}
