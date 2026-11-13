import crypto from "crypto";
import { NextFunction, Request, Response } from "express";

function verifyTelegramInitData(initData: string, botToken: string): { id: number } | null {
    try {
        const params = new URLSearchParams(initData);
        const hash = params.get("hash");
        if (!hash) return null;

        params.delete("hash");

        const dataCheckString = Array.from(params.entries())
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([key, value]) => `${key}=${value}`)
            .join("\n");

        const secretKey = crypto
            .createHmac("sha256", "WebAppData")
            .update(botToken)
            .digest();

        const expectedHash = crypto
            .createHmac("sha256", secretKey)
            .update(dataCheckString)
            .digest("hex");

        if (expectedHash !== hash) return null;

        const userStr = params.get("user");
        if (!userStr) return null;

        return JSON.parse(userStr);
    } catch {
        return null;
    }
}

// Сравнение без утечки по времени ответа
function isSameSecret(value: string, secret: string): boolean {
    const a = Buffer.from(value);
    const b = Buffer.from(secret);
    return a.length === b.length && crypto.timingSafeEqual(a, b);
}

// Бот ходит от имени пользователя: секрет BOT_SECRET + x-user-id
function getBotUserId(req: Request): string | null {
    const secret = process.env.BOT_SECRET;
    const botSecret = req.headers["x-bot-secret"] as string | undefined;
    const userId = req.headers["x-user-id"] as string | undefined;

    if (!secret || !botSecret || !userId || !isSameSecret(botSecret, secret)) return null;
    return userId;
}

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
    const initData = req.headers["x-init-data"] as string | undefined;
    const botToken = process.env.TELEGRAM_TOKEN;

    if (initData && botToken) {
        const user = verifyTelegramInitData(initData, botToken);

        if (!user) {
            res.status(401).json({ error: "Invalid initData" });
            return;
        }

        req.userId = user.id.toString();
        return next();
    }

    const botUserId = getBotUserId(req);
    if (botUserId) {
        req.userId = botUserId;
        return next();
    }

    // Локально без Телеграма — общий тестовый пользователь
    if (process.env.NODE_ENV === "development") {
        req.userId = "dev-user";
        return next();
    }

    res.status(401).json({ error: "Unauthorized" });
}