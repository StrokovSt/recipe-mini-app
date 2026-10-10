import "dotenv/config";

import { parseRecipeFromUrl } from "../services/parser";

const url = process.argv[2];

if (!url) {
    console.error("Укажи URL: npm run test:parser <url>");
    process.exit(1);
}

console.log(`Parsing: ${url}\n`);

// Категории и теги берутся у dev-пользователя
const recipe = await parseRecipeFromUrl(url, "dev-user");
console.log(JSON.stringify(recipe, null, 2));