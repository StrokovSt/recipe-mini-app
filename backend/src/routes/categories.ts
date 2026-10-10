import { NextFunction, Request, Response, Router } from "express";

import { DEFAULT_CATEGORIES } from "../config/defaults";
import prisma from "../lib/prisma";

const router = Router();

// Категории пользователя вместе с количеством рецептов
const findCategories = (userId: string) =>
    prisma.category.findMany({
        where: { userId },
        orderBy: { name: "asc" },
        include: { _count: { select: { recipes: true } } },
    });

// GET /api/categories
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.userId as string;

        let categories = await findCategories(userId);

        if (categories.length === 0) {
            await prisma.category.createMany({
                data: DEFAULT_CATEGORIES.map((category) => ({
                    userId,
                    name: category.name,
                    iconName: category.iconName,
                }))            
            });

            categories = await findCategories(userId);
        }

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
router.delete("/:id", async (req: Request, res: Response,  next: NextFunction) => {
    try {
        const id = req.params.id as string;
        const userId = req.userId as string;

        await prisma.recipe.updateMany({
            where: { userId, categoryId: id },
            data: { categoryId: null },
        });

        await prisma.category.deleteMany({
            where: { id, userId },
        });

        res.json({ ok: true });
    }
    catch (error) {
        next(error);
    }
});

export default router;