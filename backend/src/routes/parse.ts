import { Request, Response,Router } from "express";

import { parseRecipeFromUrl } from "../services/parser";

const router = Router();

function detectSource(url: string): "pinterest" | "telegram" | "other" {
    if (url.includes("pinterest.com") || url.includes("pin.it")) return "pinterest";
    if (url.includes("t.me") || url.includes("telegram.me")) return "telegram";
    return "other";
}

router.post("/", async (req: Request, res: Response) => {
    const { url } = req.body;

    if (!url) {
        res.status(400).json({ error: "Укажи URL" });
        return;
    }

    try {
        const recipe = await parseRecipeFromUrl(url);
        const source = detectSource(url);

        res.json({ ...recipe, source, sourceUrl: url });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Неизвестная ошибка";
        res.status(422).json({ error: message });
    }
});

export default router;