import "dotenv/config";

import { parseRecipeFromUrl } from "../services/parser";

// npm run test:parser -w backend -- <url> [язык: ru, en, de…]
const [url, language = "ru"] = process.argv.slice(2);

if (!url) {
    console.error("Укажи URL: npm run test:parser -w backend -- <url> [язык]");
    process.exit(1);
}

console.log(`Parsing: ${url} (язык: ${language})\n`);

// Категории и теги берутся у dev-пользователя
try {
    const recipe = await parseRecipeFromUrl(url, "dev-user", language);
    console.log(JSON.stringify(recipe, null, 2));
} catch (error) {
    // Коротко, без простыни из внутренностей запроса
    console.error("Ошибка:", error instanceof Error ? error.message : error);
    process.exit(1);
}