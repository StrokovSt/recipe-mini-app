import { NextFunction, Request, Response } from "express";

import { createError, ErrorCode } from "@recipe/common";

import { ensureUser } from "../services/user";

// Распознавание через ИИ доступно, только если у пользователя включён флаг aiEnabled
export const requireAi = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = await ensureUser(req.userId as string);

        if (!user.aiEnabled) {
            res.status(403).json(createError(ErrorCode.AI_DISABLED, "Распознавание через ИИ недоступно"));
            return;
        }

        next();
    }
    catch (error) {
        next(error);
    }
};
