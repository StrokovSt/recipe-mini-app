import "dotenv/config";

import { type GenerationConfig, GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const MODEL = "gemini-2.5-flash-lite";

// Ответ всегда чистым JSON, без ```json и пояснений
const jsonConfig: GenerationConfig = { responseMimeType: "application/json" };

export const model = genAI.getGenerativeModel({ model: MODEL, generationConfig: jsonConfig });

// Видео в низком разрешении: рецепту хватает, а токенов в ~4 раза меньше.
// mediaResolution есть в API, но нет в типах SDK
export const videoModel = genAI.getGenerativeModel({
    model: MODEL,
    generationConfig: { ...jsonConfig, mediaResolution: "MEDIA_RESOLUTION_LOW" } as GenerationConfig,
});
