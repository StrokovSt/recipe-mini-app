import { fromNodeHeaders } from "better-auth/node";
import crypto from "crypto";
import { NextFunction, Request, Response } from "express";

import { auth } from "../lib/auth";
import { getTelegramUserId, type TelegramUser } from "../services/user";

function verifyTelegramInitData(initData: string, botToken: string): TelegramUser | null {
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

// Бот ходит от имени пользователя: секрет BOT_SECRET + x-user-id (Telegram id)
function getBotUserId(req: Request): string | null {
    const secret = process.env.BOT_SECRET;
    const botSecret = req.headers["x-bot-secret"] as string | undefined;
    const userId = req.headers["x-user-id"] as string | undefined;

    if (!secret || !botSecret || !userId || !isSameSecret(botSecret, secret)) return null;
    return userId;
}

// Кто делает запрос: мини-апп (initData), бот (секрет), сайт (кука сессии)
async function resolveUserId(req: Request, res: Response): Promise<string | null> {
    const initData = req.headers["x-init-data"] as string | undefined;
    const botToken = process.env.TELEGRAM_TOKEN;

    if (initData && botToken) {
        const telegramUser = verifyTelegramInitData(initData, botToken);
        return telegramUser ? getTelegramUserId(telegramUser) : null;
    }

    const botUserId = getBotUserId(req);
    if (botUserId) return getTelegramUserId({ id: botUserId });

    // Локально на сайте тоже входим по-настоящему: так видна страница входа.
    // Better Auth обновляет куку с копией сессии: передаём её браузеру, иначе каждый запрос шёл бы в базу за сессией
    const { response: session, headers } = await auth.api.getSession({
        headers: fromNodeHeaders(req.headers),
        returnHeaders: true,
    });
    headers.getSetCookie().forEach((cookie) => res.append("Set-Cookie", cookie));

    return session?.user.id ?? null;
}

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = await resolveUserId(req, res);

        if (!userId) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

        req.userId = userId;
        next();
    }
    catch (error) {
        next(error);
    }
}
