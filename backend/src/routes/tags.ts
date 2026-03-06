import { Request, Response, Router } from "express";

import { DEFAULT_TAGS } from "../config/defaults";
import prisma from "../lib/prisma";

const router = Router();

// GET /api/tags
router.get("/", async (req: Request, res: Response) => {
    const userId = req.userId;

    let tags = await prisma.tag.findMany({
        where: { userId },
        orderBy: { name: "asc" },
    });

    if (tags.length === 0) {
        await prisma.tag.createMany({
        data: DEFAULT_TAGS.map((name) => ({ userId, name })),
        skipDuplicates: true,
        });

        tags = await prisma.tag.findMany({
        where: { userId },
        orderBy: { name: "asc" },
        });
    }

    res.json(tags);
});

// POST /api/tags
router.post("/", async (req: Request, res: Response) => {
    const { name } = req.body;
    if (!name) {
        res.status(400).json({ error: "Название тега обязательно" });
        return;
    }

    const tag = await prisma.tag.upsert({
        where: { userId_name: { userId: req.userId, name } },
        update: {},
        create: { userId: req.userId, name },
    });

    res.status(201).json(tag);
});

// PATCH /api/tags/:id
router.patch("/:id", async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const userId = req.userId as string;
    const { name } = req.body;

    const tag = await prisma.tag.updateMany({
        where: { id, userId },
        data: { name },
    });

    res.json(tag);
});

// DELETE /api/tags/:id
router.delete("/:id", async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const userId = req.userId as string;

    await prisma.tag.deleteMany({
        where: { id, userId },
    });

    res.json({ ok: true });
});

export default router;