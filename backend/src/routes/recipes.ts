import { Request, Response, Router } from "express";

import prisma from "../lib/prisma";

const router = Router();

function parseRecipe(recipe: Record<string, unknown>) {
    return {
        ...recipe,
        ingredients: JSON.parse(recipe.ingredients as string),
        steps: JSON.parse(recipe.steps as string),
    };
}

// GET /api/recipes?category=Паста&search=карб
router.get("/", async (req: Request, res: Response) => {
    const { category, search } = req.query;

    const recipes = await prisma.recipe.findMany({
        where: {
            userId: req.userId,
            ...(category && category !== "Все" ? { category: category as string } : {}),
            ...(search ? { title: { contains: search as string } } : {}),
        },
        include: {
            media: { orderBy: { order: "asc" } },
            tags: { include: { tag: true } },
        },
        orderBy: { createdAt: "desc" },
    });

    res.json(recipes.map(parseRecipe));
});

// GET /api/recipes/categories
router.get("/categories", async (req: Request, res: Response) => {
    const categories = await prisma.recipe.findMany({
        where: { userId: req.userId },
        select: { category: true },
        distinct: ["category"],
    });

    res.json(["Все", ...categories.map((c: { category: string }) => c.category)]);
});

// GET /api/recipes/:id
router.get("/:id", async (req: Request, res: Response) => {
    const recipe = await prisma.recipe.findFirst({
        where: {
        id: req.params.id as string,
        userId: req.userId,
        },
        include: {
        media: { orderBy: { order: "asc" } },
        tags: { include: { tag: true } },
        },
    });

    if (!recipe) {
        res.status(404).json({ error: "Рецепт не найден" });
        return;
    }

    res.json(parseRecipe(recipe));
});

// POST /api/recipes
router.post("/", async (req: Request, res: Response) => {
    const userId = req.userId;
    const { title, category, ingredients, steps, time, servings, sourceUrl, source, media, tags } = req.body;

    if (!title || !ingredients || !steps || !sourceUrl) {
        res.status(400).json({ error: "Не хватает обязательных полей" });
        return;
    }

    const recipe = await prisma.recipe.create({
        data: {
        userId,
        title,
        category: category || "Без категории",
        ingredients: JSON.stringify(ingredients),
        steps: JSON.stringify(steps),
        time: time || null,
        servings: servings ? Number(servings) : null,
        sourceUrl,
        source: source || "other",
        media: {
            create: (media || []).map((m: { url: string; type: string }, i: number) => ({
            url: m.url,
            type: m.type,
            order: i,
            })),
        },
        tags: {
            create: await resolveTags(tags || [], userId),
        },
        },
        include: {
            media: true,
            tags: { include: { tag: true } },
        },
    });

    res.status(201).json(recipe);
});

// DELETE /api/recipes/:id
router.delete("/:id", async (req: Request, res: Response) => {
    await prisma.recipe.deleteMany({
        where: {
            id: req.params.id as string,
            userId: req.userId,
        },
    });

    res.json({ ok: true });
});

// ── Helper ─────────────────────────────────────────────────────────────────
async function resolveTags(tagNames: string[], userId: string) {
    const userTags = await prisma.tag.findMany({
        where: {
        userId,
        name: { in: tagNames },
        },
    });

    return userTags.map((tag: { id: string }) => ({ tagId: tag.id }));
}

export default router;