import type { IngredientGroup } from "./recipe";

interface Searchable {
    title: string;
    ingredients: IngredientGroup[];
}

// Текст для сравнения: без регистра, ё = е, лишние пробелы убраны
export function normalizeSearch(text: string): string {
    return text.toLowerCase().replace(/ё/g, "е").replace(/\s+/g, " ").trim();
}

// Поиск по названию и ингредиентам. Каждое слово запроса должно найтись, порядок слов не важен
// («суп грибной» найдёт «Грибной суп»). Сначала рецепты, где всё нашлось в названии, потом остальные,
// внутри прежний порядок. Одна функция для сервера и фронтенда, чтобы список до ответа сервера совпадал с ответом
export function searchRecipes<T extends Searchable>(recipes: T[], search?: string): T[] {
    const words = normalizeSearch(search ?? "").split(" ").filter(Boolean);

    if (words.length === 0) return recipes;

    const byTitle: T[] = [];
    const byIngredients: T[] = [];

    for (const recipe of recipes) {
        const title = normalizeSearch(recipe.title);

        if (words.every((word) => title.includes(word))) {
            byTitle.push(recipe);
            continue;
        }

        const names = recipe.ingredients.flatMap(({ items }) => items.map(({ name }) => normalizeSearch(name)));
        const text = [title, ...names].join(" ");

        if (words.every((word) => text.includes(word))) byIngredients.push(recipe);
    }

    return [...byTitle, ...byIngredients];
}
