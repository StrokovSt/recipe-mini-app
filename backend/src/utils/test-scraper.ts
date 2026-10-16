import "dotenv/config";

import * as cheerio from "cheerio";

import { extractPin, fetchCaptions, isPinterestUrl, pinToText, toPlayableVideo } from "../services/pinterest";
import { extractMedia, extractText, fetchPage } from "./scraper";

const url = process.argv[2];

if (!url) {
    console.error("❌ Ошибка: Укажи URL. Пример: npm run test:scraper <url>");
    process.exit(1);
}

async function run() {
    try {
        console.log(`🌐 Fetching: ${url} ...`);
        
        const html = await fetchPage(url);
        const $ = cheerio.load(html);
        
        // Извлечение данных
        const text = extractText(html);
        const media = extractMedia(html, url);
        
        // JSON-LD с безопасным парсингом
        const jsonLdRaw = $('script[type="application/ld+json"]')
            .map((_, el) => $(el).html())
            .get();

        const jsonLdParsed = jsonLdRaw.map(content => {
            try {
                return JSON.parse(content || "{}");
            } catch {
                return "⚠️ [Invalid JSON]";
            }
        });

        // Форматированный вывод
        console.log("\n" + "=".repeat(30));
        console.log("📄 METADATA (JSON-LD)");
        console.log(JSON.stringify(jsonLdParsed, null, 2));

        console.log("\n" + "=".repeat(30));
        console.log(`📝 TEXT (Length: ${text.length} chars)`);
        console.log(text.substring(0, 500) + (text.length > 500 ? "..." : "")); // Ограничим вывод для чистоты

        console.log("\n" + "=".repeat(30));
        console.log("🖼️  MEDIA");
        console.table(media); // Красивая таблица для массивов объектов

        if (isPinterestUrl(url)) {
            const pin = extractPin(html);
            const captions = pin.captionsUrl ? await fetchCaptions(pin.captionsUrl) : "";
            const video = pin.video ? await toPlayableVideo(pin.video) : null;

            console.log("\n" + "=".repeat(30));
            console.log("📌 PIN");
            console.log({ ...pin, playableVideo: video });
            console.log("\n📝 TEXT FOR AI:\n" + pinToText(pin, captions));
        }

    } catch (error) {
        console.error("🔥 Critical Error:", error instanceof Error ? error.message : error);
    }
}

run();