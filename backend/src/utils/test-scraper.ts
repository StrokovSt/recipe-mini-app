import "dotenv/config";

import * as cheerio from "cheerio";

import { extractMedia, extractText, fetchPage } from "./scraper";

const url = process.argv[2];

if (!url) {
    console.error("Укажи URL: npm run test:scraper <url>");
    process.exit(1);
}

console.log(`Fetching: ${url}\n`);

const html = await fetchPage(url);
const $ = cheerio.load(html);
const text = extractText(html);
const media = extractMedia(html);

const jsonLd = $('script[type="application/ld+json"]')
  .map((_i: number, el: cheerio.Element) => $(el).html())
  .get();

console.log("=== JSON-LD ===");
console.log(jsonLd);
console.log("=== FULL TEXT ===");
console.log(text);
console.log("\n=== MEDIA ===");
console.log(`\n=== TEXT LENGTH: ${text.length} символов ===`);
console.log(media);