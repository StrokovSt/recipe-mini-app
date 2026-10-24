import catEmpty from "@/shared/assets/images/messages/cat-empty.webp";
import catError from "@/shared/assets/images/messages/cat-error.webp";
import catIdea from "@/shared/assets/images/messages/cat-idea.webp";
import catWarning from "@/shared/assets/images/messages/cat-warning.webp";

// Картинки сообщений. Новая: файл в assets/images/messages (cat-<смысл>.webp, 480px, прозрачный фон) и строка здесь
export const MESSAGE_ILLUSTRATIONS = {
    // Кот с «ERROR» и вопросом: страница не найдена
    error: catError,
    // Кот с жёлтым знаком: рецепт не найден
    warning: catWarning,
    // Кот с лампочкой: подсказки
    idea: catIdea,
    // Кот над пустой книгой: пустой список рецептов
    empty: catEmpty,
} satisfies Record<string, string>;

export type MessageIllustration = keyof typeof MESSAGE_ILLUSTRATIONS;
