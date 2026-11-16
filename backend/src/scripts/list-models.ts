import "dotenv/config";

import { GoogleGenAI } from "@google/genai";

// Модели Gemini, доступные нашему ключу: npm run test:models -w backend
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY!, apiVersion: "v1beta" });

const models = [];

for await (const model of await ai.models.list({ config: { pageSize: 100 } })) {
    // Только те, что умеют отвечать на запросы (без эмбеддингов, картинок и озвучки)
    if (!model.supportedActions?.includes("generateContent")) continue;

    models.push({ name: model.name?.replace("models/", ""), title: model.displayName, input: model.inputTokenLimit, output: model.outputTokenLimit });
}

console.table(models.sort((a, b) => String(a.name).localeCompare(String(b.name))));
