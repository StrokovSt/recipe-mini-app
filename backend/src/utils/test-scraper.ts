import "dotenv/config";

import { extractMedia, extractText, fetchPage } from "./scraper";

const url = process.argv[2];

if (!url) {
    console.error("Укажи URL: npm run test:scraper <url>");
    process.exit(1);
}

console.log(`Fetching: ${url}\n`);

const html = await fetchPage(url);
const text = extractText(html);
const media = extractMedia(html);

console.log("=== TEXT (первые 500 символов) ===");
console.log(text.slice(0, 500));
console.log("\n=== MEDIA ===");
console.log(media);