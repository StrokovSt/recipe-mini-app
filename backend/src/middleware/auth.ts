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

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
    const initData = req.headers["x-init-data"] as string | undefined;
    const botToken = process.env.TELEGRAM_TOKEN;

    // Если нет токена или initData — dev режим
    if (!botToken || !initData) {
        const userId = req.headers["x-user-id"] as string | undefined;
        req.userId = userId || "dev-user";
        return next();
    }

    const user = verifyTelegramInitData(initData, botToken);

    if (!user) {
        res.status(401).json({ error: "Invalid initData" });
        return;
    }

    req.userId = user.id.toString();
    next();
}