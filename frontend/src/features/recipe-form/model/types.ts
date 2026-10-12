import type { DraftOrigin, ParsedRecipe } from "@recipe/common";

import type { RecipeFormValues } from "./schema";

// Откуда рецепт, если его распознал ИИ; без него «other» и пустая ссылка
export type RecipeFormSource = Pick<ParsedRecipe, "source" | "sourceUrl">;

// Черновик, в который форма сохраняется сама. id нет, пока черновик не создан
export interface RecipeFormDraft {
    id?: string;
    origin: DraftOrigin;
}

// Что лежит в черновике на сервере
export interface RecipeDraftData {
    values: RecipeFormValues;
    sourceUrl: string;
}

export interface RecipeFormProps {
    // Заголовок и подзаголовок в шапке страницы
    title: string;
    subtitle?: string;
    defaultValues?: Partial<RecipeFormValues>;
    submitLabel?: string;
    onSubmit?: (values: RecipeFormValues) => void;
    isPending?: boolean;
    source?: RecipeFormSource;
    // Только для нового рецепта: форма автоматически сохраняется в черновик
    draft?: RecipeFormDraft;
}

// Состояние роутера при переходе с импорта на форму создания, если черновик создать не удалось
export interface RecipeDraftState {
    parsed: ParsedRecipe;
}
