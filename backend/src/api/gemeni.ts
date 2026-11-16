import "dotenv/config";

import { ApiError, FileState, type GenerateContentConfig, GoogleGenAI, MediaResolution, type Part, type Schema } from "@google/genai";

// v1beta: ответ в JSON по схеме и видео в низком разрешении в v1 не работают
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY!, apiVersion: "v1beta" });

// Быстрая модель — для обычного распознавания, сильная — для второй попытки, когда быстрая не справилась
export const FAST_MODEL = process.env.GEMINI_MODEL ?? "gemini-2.5-flash-lite";
export const STRONG_MODEL = process.env.GEMINI_STRONG_MODEL ?? "gemini-2.5-flash";

const MAX_RETRIES = 3;
const RETRY_DELAY = 2000;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Больше этого файл не влезет внутрь запроса: загружаем его в хранилище Gemini отдельно
const MAX_INLINE_BYTES = 15 * 1024 * 1024;
const FILE_READY_TIMEOUT = 120000;

export const isBadRequest = (error: unknown) => error instanceof ApiError && error.status === 400;

// Видео для запроса. Небольшое кладём прямо в запрос, большое загружаем в Gemini и ждём, пока он его обработает.
// remove — удалить загруженный файл после запроса (сам он удаляется через 48 часов)
export async function toVideoPart(data: Buffer, mimeType: string): Promise<{ part: Part; remove: () => Promise<void> }> {
    if (data.byteLength <= MAX_INLINE_BYTES) {
        return { part: { inlineData: { mimeType, data: data.toString("base64") } }, remove: async () => {} };
    }

    let file = await ai.files.upload({ file: new Blob([new Uint8Array(data)], { type: mimeType }), config: { mimeType } });
    const name = file.name!;
    const remove = async () => {
        await ai.files.delete({ name }).catch(() => {});
    };
    const deadline = Date.now() + FILE_READY_TIMEOUT;

    while (file.state === FileState.PROCESSING && Date.now() < deadline) {
        await sleep(2000);
        file = await ai.files.get({ name });
    }

    if (file.state !== FileState.ACTIVE || !file.uri) {
        await remove();
        throw new Error(`Gemini не обработал видео: ${file.state}`);
    }

    return { part: { fileData: { fileUri: file.uri, mimeType } }, remove };
}

interface GenerateOptions {
    parts: Part[];
    // Схема ответа: Gemini вернёт JSON ровно такой формы
    schema: Schema;
    model?: string;
    // Видео в низком разрешении: рецепту хватает, а токенов в ~4 раза меньше
    lowResolution?: boolean;
}

// Запрос к Gemini с ответом в JSON по схеме. 503 повторяем, 429 превращаем в QUOTA_EXCEEDED:<мс до повтора>
export async function generateJson<T>({ parts, schema, model = FAST_MODEL, lowResolution }: GenerateOptions, attempt = 1): Promise<T> {
    const config: GenerateContentConfig = {
        responseMimeType: "application/json",
        responseSchema: schema,
        temperature: 0,
        ...(lowResolution && { mediaResolution: MediaResolution.MEDIA_RESOLUTION_LOW }),
    };

    try {
        const response = await ai.models.generateContent({ model, contents: [{ role: "user", parts }], config });
        const usage = response.usageMetadata;
        console.info(`Gemini ${model}: запрос ${usage?.promptTokenCount ?? "?"} токенов, ответ ${(usage?.candidatesTokenCount ?? 0) + (usage?.thoughtsTokenCount ?? 0)}`);

        return JSON.parse(response.text ?? "") as T;
    } catch (error) {
        const status = error instanceof ApiError ? error.status : 0;
        const message = error instanceof Error ? error.message : "";

        if (status === 503 && attempt < MAX_RETRIES) {
            console.warn(`Gemini 503, повтор ${attempt}/${MAX_RETRIES} через ${RETRY_DELAY * attempt}ms...`);
            await sleep(RETRY_DELAY * attempt);
            return generateJson({ parts, schema, model, lowResolution }, attempt + 1);
        }

        if (status === 429) {
            const retryMatch = message.match(/retryDelay.*?(\d+)s/);
            throw new Error(`QUOTA_EXCEEDED:${retryMatch ? parseInt(retryMatch[1]) * 1000 : 60000}`);
        }

        // Код в тексте ошибки: по нему маршрут отличает «ИИ недоступен» от остального
        if (status === 503) throw new Error(`Gemini 503: ${message}`);

        throw error;
    }
}
