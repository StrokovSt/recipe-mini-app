import { NextFunction, Request, Response } from "express";

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
    const userId = req.headers["x-user-id"] as string;

    if (!userId) {
        res.status(401).json({ error: "x-user-id header is required" });
        return;
    }

    req.userId = userId;
    next();
}