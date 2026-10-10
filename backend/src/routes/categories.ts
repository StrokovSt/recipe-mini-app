import { NextFunction, Request, Response, Router } from "express";

import prisma from "../lib/prisma";
import { ensureCategories, getFallbackCategory } from "../services/userDefaults";

const router = Router();

// Категории пользователя вместе с количеством рецептов, «Разное» в конце
const findCategories = (userId: string) =>
    prisma.category.findMany({
        where: { userId },
        orderBy: [{ isDefault: "asc" }, { name: "asc" }],
        include: { _count: { select: { recipes: true } } },
    });

// GET /api/categories
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.userId as string;

        await ensureCategories(userId);
        const categories = await findCategories(userId);

        res.json(categories.map(({ _count, ...category }) => ({ ...category, recipeCount: _count.recipes })));    
    } 
    catch (error) {
        next(error);
    }
});

// POST /api/categories
router.post("/", async (req: Request, res: Response,  next: NextFunction) => {
    try {
        const userId = req.userId as string;
        const { name, iconName } = req.body;

        if (!name) {
            res.status(400).json({ error: "Название категории обязательно" });
            return;
        }

        const category = await prisma.category.upsert({
            where: {
                userId_name: {
                    userId,
                    name,
                },
            },
            update: {},
            create: {
                userId,
                name,
                iconName: iconName || "Cutlery",
            },
        });

        res.status(201).json(category);
    }
    catch (error) {
        next(error);
    }
});

// PATCH /api/categories/:id
router.patch("/:id", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = req.params.id as string;
        const userId = req.userId as string;
        const { name, iconName } = req.body;

        if (!name) {
            res.status(400).json({
                error: "Название категории обязательно",
            });
            return;
        }

        const category = await prisma.category.updateMany({
            where: { id, userId },
            data: {
                name,
                ...(iconName !== undefined && { iconName }),
            },
        });

        res.json(category);
    } catch (error) {
        next(error);
    }
});

// DELETE /api/categories/:id
// Рецепты удаляемой категории переезжают в «Разное», саму «Разное» удалить нельзя
router.delete("/:id", async (req: Request, res: Response,  next: NextFunction) => {
    try {
        const id = req.params.id as string;
        const userId = req.userId as string;

        const category = await prisma.category.findFirst({ where: { id, userId } });

        if (category?.isDefault) {
            res.status(400).json({ error: "Резервную категорию удалить нельзя" });
            return;
        }

        if (category) {
            const fallback = await getFallbackCategory(userId);

            await prisma.$transaction([
                prisma.recipe.updateMany({
                    where: { userId, categoryId: id },
                    data: { categoryId: fallback.id },
                }),
                prisma.category.delete({ where: { id } }),
            ]);
        }

        res.json({ ok: true });
    }
    catch (error) {
        next(error);
    }
});

export default router;
