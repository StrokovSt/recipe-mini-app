import { NextFunction, Request, Response } from "express";

import { PLAN_LIMITS } from "../config/limits";
import prisma from "../lib/prisma";

export const checkRecipeLimit = async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.userId as string;

    // Находим или создаём пользователя
    const user = await prisma.user.upsert({
        where: { id: userId },
        update: {},
        create: { id: userId },
    });

    const plan = user.plan as keyof typeof PLAN_LIMITS;
    const limit = PLAN_LIMITS[plan].recipes;

    console.log('user: ', user);
    console.log('limit: ', limit);

    // Infinity означает PRO — без ограничений
    if (limit === Infinity) {
        return next();
    }

    const count = await prisma.recipe.count({
        where: { userId },
    });

    if (count >= limit) {
        res.status(403).json({
            error: "LIMIT_REACHED",
            message: `Лимит ${limit} рецептов для бесплатного плана достигнут`,
            limit,
            current: count,
        });
        return;
    }

    next();
};