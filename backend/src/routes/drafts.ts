import { NextFunction, Request, Response, Router } from "express";

import { createError, DRAFT_LIMIT, ErrorCode } from "@recipe/common";

import prisma from "../lib/prisma";
import { validateId } from "../middleware/validate";
import { createDraftSchema, updateDraftSchema } from "../validation/draft";

const router = Router();

// Список без данных формы, они нужны только при открытии черновика
const SUMMARY_SELECT = {
    id: true,
    title: true,
    origin: true,
    source: true,
    createdAt: true,
    updatedAt: true,
} as const;

function parseDraft<T extends { data: string }>(draft: T) {
    return { ...draft, data: JSON.parse(draft.data) as unknown };
}

// GET /api/drafts
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const drafts = await prisma.draft.findMany({
            where: { userId: req.userId },
            select: SUMMARY_SELECT,
            orderBy: { updatedAt: "desc" },
        });

        res.json(drafts);
    }
    catch (error) {
        next(error);
    }
});

// GET /api/drafts/:id
router.get("/:id", validateId, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const draft = await prisma.draft.findFirst({
            where: { id: req.params.id as string, userId: req.userId },
        });

        if (!draft) {
            res.status(404).json({ error: "Черновик не найден" });
            return;
        }

        res.json(parseDraft(draft));
    }
    catch (error) {
        next(error);
    }
});

// POST /api/drafts
router.post("/", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const parsed = createDraftSchema.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({
                error: "Некорректные данные",
                details: parsed.error.flatten().fieldErrors,
            });
            return;
        }

        const userId = req.userId as string;
        const count = await prisma.draft.count({ where: { userId } });

        if (count >= DRAFT_LIMIT) {
            res.status(403).json({
                ...createError(ErrorCode.DRAFT_LIMIT_REACHED, `Можно хранить не больше ${DRAFT_LIMIT} черновиков`),
                limit: DRAFT_LIMIT,
                current: count,
            });
            return;
        }

        const { title, origin, source, data } = parsed.data;

        const draft = await prisma.draft.create({
            data: { userId, title, origin, source, data: JSON.stringify(data) },
        });

        res.status(201).json(parseDraft(draft));
    }
    catch (error) {
        next(error);
    }
});

// PATCH /api/drafts/:id
router.patch("/:id", validateId, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const parsed = updateDraftSchema.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({
                error: "Некорректные данные",
                details: parsed.error.flatten().fieldErrors,
            });
            return;
        }

        const id = req.params.id as string;
        const { title, data } = parsed.data;

        const existing = await prisma.draft.findFirst({ where: { id, userId: req.userId }, select: { id: true } });

        if (!existing) {
            res.status(404).json({ error: "Черновик не найден" });
            return;
        }

        const updated = await prisma.draft.update({
            where: { id },
            data: {
                ...(title !== undefined && { title }),
                ...(data !== undefined && { data: JSON.stringify(data) }),
            },
            select: SUMMARY_SELECT,
        });

        res.json(updated);
    }
    catch (error) {
        next(error);
    }
});

// DELETE /api/drafts/:id
router.delete("/:id", validateId, async (req: Request, res: Response, next: NextFunction) => {
    try {
        await prisma.draft.deleteMany({
            where: { id: req.params.id as string, userId: req.userId },
        });

        res.json({ ok: true });
    }
    catch (error) {
        next(error);
    }
});

export default router;
