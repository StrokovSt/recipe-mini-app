import { Request, Response, Router } from "express";

import { IngredientGroup } from "@recipe/common";

import prisma from "../lib/prisma";

const router = Router();

function parseRecipe(recipe: Record<string, unknown>) {
    return {
        ...recipe,
        ingredients: JSON.parse(recipe.ingredients as string) as IngredientGroup[],
        steps: JSON.parse(recipe.steps as string) as string[],
    };
}

// GET /api/recipes?categoryId=xxx&search=карб
router.get("/", async (req: Request, res: Response) => {
    const { categoryId, search } = req.query;

    const recipes = await prisma.recipe.findMany({
        where: {
            userId: req.userId,
            ...(categoryId ? { categoryId: categoryId as string } : {}),
            ...(search ? { title: { contains: search as string, mode: "insensitive" } } : {}),
        },
        include: {
            category: true,
            media: { orderBy: { order: "asc" } },
            tags: { include: { tag: true } },
        },
        orderBy: { createdAt: "desc" },
    });

    res.json(recipes.map(parseRecipe));
});

// GET /api/recipes/:id
router.get("/:id", async (req: Request, res: Response) => {
    const recipe = await prisma.recipe.findFirst({
        where: {
            id: req.params.id as string,
            userId: req.userId,
        },
        include: {
            category: true,
            media: { orderBy: { order: "asc" } },
            tags: { include: { tag: true } },
        },
    });

    if (!recipe) {
        res.status(404).json({ error: "Рецепт не найден" });
        return;
    }

    res.json(parseRecipe(recipe as unknown as Record<string, unknown>));
});

// POST /api/recipes
router.post("/", async (req: Request, res: Response) => {
    const userId = req.userId as string;
    const { title, category, categoryId, ingredients, steps, time, servings, sourceUrl, source, media, tags } = req.body;

    if (!title) {
        res.status(400).json({ error: "Не хватает обязательного поля title" });
        return;
    }

    if (!ingredients) {
        res.status(400).json({ error: "Не хватает обязательного поля ingredients" });
        return;
    }

    let resolvedCategoryId: string | null = categoryId ?? null;

    // Если передана строка category — находим или создаём
    if (!resolvedCategoryId && category && category !== "Без категории") {
        const cat = await prisma.category.upsert({
            where: { userId_name: { userId, name: category } },
            update: {},
            create: { userId, name: category },
        });
        resolvedCategoryId = cat.id;
    }

    const recipe = await prisma.recipe.create({
        data: {
            userId,
            title,
            categoryId: resolvedCategoryId,
            ingredients: JSON.stringify(ingredients),
            steps: steps ? JSON.stringify(steps) : "",
            time: time || null,
            servings: servings ? Number(servings) : null,
            sourceUrl: sourceUrl || "",
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
            category: true,
            media: true,
            tags: { include: { tag: true } },
        },
    });

    res.status(201).json(recipe);
});

// PATCH /api/recipes/:id
router.patch("/:id", async (req: Request, res: Response) => {
    const userId = req.userId as string;
    const id = req.params.id as string;
    const { title, category, categoryId, ingredients, steps, time, servings, tags } = req.body;

    let resolvedCategoryId: string | null | undefined = categoryId;

    if (resolvedCategoryId === undefined && category && category !== "Без категории") {
        const cat = await prisma.category.upsert({
            where: { userId_name: { userId, name: category } },
            update: {},
            create: { userId, name: category },
        });
        resolvedCategoryId = cat.id;
    }

    if (tags !== undefined) {
        await prisma.recipeTag.deleteMany({ where: { recipeId: id } });
    }

    await prisma.recipe.updateMany({
        where: { id, userId },
        data: {
            ...(title && { title }),
            ...(resolvedCategoryId !== undefined && { categoryId: resolvedCategoryId }),
            ...(ingredients && { ingredients: JSON.stringify(ingredients) }),
            ...(steps && { steps: JSON.stringify(steps) }),
            ...(time !== undefined && { time }),
            ...(servings !== undefined && { servings: servings ? Number(servings) : null }),
        },
    });

    if (tags !== undefined) {
        const resolvedTags = await resolveTags(tags, userId);
        await prisma.recipeTag.createMany({
            data: resolvedTags.map((t) => ({ recipeId: id, tagId: t.tagId })),
        });
    }

    const updated = await prisma.recipe.findFirst({
        where: { id, userId },
        include: {
            category: true,
            media: true,
            tags: { include: { tag: true } },
        },
    });

    res.json(parseRecipe(updated as unknown as Record<string, unknown>));
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