import { Request, Response, Router } from "express";

import prisma from "../lib/prisma";

const router = Router();

// GET /api/categories
router.get("/", async (req: Request, res: Response) => {
    const categories = await prisma.recipe.findMany({
        where: { userId: req.userId },
        select: { category: true },
        distinct: ["category"],
        orderBy: { category: "asc" },
    });

    res.json(categories.map((c: { category: string }) => c.category));
});

// POST /api/categories — переименовать категорию для всех рецептов
router.post("/rename", async (req: Request, res: Response) => {
    const { from, to } = req.body;

    if (!from || !to) {
        res.status(400).json({ error: "Нужны поля from и to" });
        return;
    }

    await prisma.recipe.updateMany({
        where: { userId: req.userId, category: from },
        data: { category: to },
    });

    res.json({ ok: true });
});

// DELETE /api/categories — сбросить категорию у всех рецептов
router.delete("/", async (req: Request, res: Response) => {
    const { name } = req.body;

    await prisma.recipe.updateMany({
        where: { userId: req.userId, category: name },
        data: { category: "Без категории" },
    });

    res.json({ ok: true });
});

export default router;