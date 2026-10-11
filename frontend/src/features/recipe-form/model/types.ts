import type { ParsedRecipe } from "@recipe/common";

import type { RecipeFormValues } from "./schema";

export interface RecipeFormProps {
    // Заголовок и подзаголовок в шапке страницы
    title: string;
    subtitle?: string;
    defaultValues?: Partial<RecipeFormValues>;
    submitLabel?: string;
    onSubmit?: (values: RecipeFormValues) => void;
    isPending?: boolean;
    // Откуда рецепт, если его распознал ИИ; без него «other» и пустая ссылка
    source?: Pick<ParsedRecipe, "source" | "sourceUrl">;
}

// Состояние роутера при переходе с импорта на форму создания
export interface RecipeDraftState {
    parsed: ParsedRecipe;
}
