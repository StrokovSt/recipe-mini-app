import { Request, Response, Router } from "express";

import { createError, ErrorCode } from "@recipe/common";

import { parseRecipeFromImage, parseRecipeFromText, parseRecipeFromUrl } from "../services/parser";

const router = Router();

function detectSource(url: string): "pinterest" | "telegram" | "other" {
    if (url.includes("pinterest.com") || url.includes("pin.it")) return "pinterest";
    if (url.includes("t.me") || url.includes("telegram.me")) return "telegram";
    return "other";
}

function handleParseError(error: unknown, res: Response) {
    const message = error instanceof Error ? error.message : "Неизвестная ошибка";

    if (message.includes("503") || message.includes("unavailable")) {
        res.status(503).json(createError(ErrorCode.AI_UNAVAILABLE, "AI сервис временно недоступен, попробуй позже"));
        return;
    }

    if (message.includes("QUOTA_EXCEEDED")) {
        const retryAfter = message.split(":")[1];
        res.status(429).json(createError(
            ErrorCode.AI_UNAVAILABLE,
            `Превышен лимит запросов. Попробуй через ${Math.ceil(Number(retryAfter) / 1000)} секунд`
        ));
        return;
    }

    if (message.includes("Рецепт не найден")) {
        res.status(422).json(createError(ErrorCode.PARSE_FAILED, "Не удалось найти рецепт по этой ссылке"));
        return;
    }

    res.status(500).json(createError(ErrorCode.PARSE_FAILED, message));
}

// POST /api/parse { url }
router.post("/", async (req: Request, res: Response) => {
    const { url, existingMedia = [] } = req.body;

    if (!url) {
        res.status(400).json(createError(ErrorCode.INVALID_URL, "Укажи URL"));
        return;
    }

    try {
        const recipe = await parseRecipeFromUrl(url);
        const source = detectSource(url);
        const combinedMedia = [...existingMedia, ...(recipe.media || [])];

        res.json({ ...recipe, source, sourceUrl: url, media: combinedMedia });
    }
    catch (error) {
        handleParseError(error, res);
    }
});

// POST /api/parse/image { base64, mimeType }
router.post("/image", async (req: Request, res: Response) => {
    const { base64, mimeType } = req.body;

    if (!base64 || !mimeType) {
        res.status(400).json(createError(ErrorCode.INVALID_URL, "Укажи base64 и mimeType"));
        return;
    }

    try {
        const recipe = await parseRecipeFromImage(base64, mimeType);
        res.json({ ...recipe, source: "other", sourceUrl: "" });
    } catch (error) {
        handleParseError(error, res);
    }
});

// POST /api/parse/text { text }
router.post("/text", async (req: Request, res: Response) => {
    const { text } = req.body;

    if (!text || text.length < 10) {
        res.status(400).json(createError(ErrorCode.INVALID_URL, "Текст слишком короткий"));
        return;
    }

    try {
        const parsed = await parseRecipeFromText(text);
        res.json({ ...parsed, source: "telegram", sourceUrl: "" });
    } catch (error) {
        handleParseError(error, res);
    }
});

export default router;