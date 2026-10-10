import { NextFunction, Request, Response, Router } from "express";
import { z } from "zod";

import type { Theme, User } from "@recipe/common";

import { PLAN_LIMITS } from "../config/limits";
import prisma from "../lib/prisma";
import { ensureUser } from "../services/user";

const router = Router();

const updateSettingsSchema = z.object({
    language: z.string().regex(/^[a-z]{2,3}$/).nullable().optional(),
    theme: z.enum(["light", "dark"]).nullable().optional(),
    animations: z.boolean().nullable().optional(),
});

async function buildUser(userId: string): Promise<User> {
    const [user, recipeCount] = await Promise.all([
        ensureUser(userId),
        prisma.recipe.count({ where: { userId } }),
    ]);

    const limit = PLAN_LIMITS[user.plan as keyof typeof PLAN_LIMITS].recipes;

    return {
        id: user.id,
        plan: user.plan,
        recipeLimit: Number.isFinite(limit) ? limit : null,
        recipeCount,
        aiEnabled: user.aiEnabled,
        language: user.language,
        theme: user.theme as Theme | null,
        animations: user.animations,
    };
}

// GET /api/me
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.json(await buildUser(req.userId as string));
    }
    catch (error) {
        next(error);
    }
});

// PATCH /api/me { language?, theme?, animations? } — тариф и флаг ИИ отсюда не меняются
router.patch("/", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const parsed = updateSettingsSchema.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({
                error: "Некорректные данные",
                details: parsed.error.flatten().fieldErrors,
            });
            return;
        }

        const userId = req.userId as string;

        await ensureUser(userId);
        await prisma.user.update({ where: { id: userId }, data: parsed.data });

        res.json(await buildUser(userId));
    }
    catch (error) {
        next(error);
    }
});

export default router;
