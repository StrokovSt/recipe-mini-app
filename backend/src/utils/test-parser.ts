import "dotenv/config";

import { parseRecipeFromUrl } from "../services/parser";

const url = process.argv[2];

if (!url) {
    console.error("Укажи URL: npm run test:parser <url>");
    process.exit(1);
}

console.log(`Parsing: ${url}\n`);

const recipe = await parseRecipeFromUrl(url);
console.log(JSON.stringify(recipe, null, 2));