import { NextFunction, Request, Response, Router } from "express";

import { IngredientGroup } from "@recipe/common";

import prisma from "../lib/prisma";
import { checkRecipeLimit } from "../middleware/checkLimits";
import { cuidSchema, validateId } from "../middleware/validate";
import { createRecipeSchema, updateRecipeSchema } from "../validation/recipe";

const router = Router();

function parseRecipe(recipe: Record<string, unknown>) {
    return {
        ...recipe,
        ingredients: JSON.parse(recipe.ingredients as string) as IngredientGroup[],
        steps: JSON.parse(recipe.steps as string) as string[],
    };
}

// GET /api/recipes?categoryId=xxx&search=карб
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { categoryId, search } = req.query;

        if (categoryId) {
            const result = cuidSchema.safeParse(categoryId);
            if (!result.success) {
                res.status(400).json({ error: "Некорректный categoryId" });
                return;
            }
        }

        if (search && (search as string).length > 100) {
            res.status(400).json({ error: "Слишком длинный поисковый запрос" });
            return;
        }

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
    } 
    catch (error) {
        next(error);
    }
});

// GET /api/recipes/:id
router.get("/:id", validateId, async (req: Request, res: Response, next: NextFunction) => {
    try {
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
    } 
    catch (error) {
        next(error);
    }
});

// POST /api/recipes
router.post("/", checkRecipeLimit, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const parsed = createRecipeSchema.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({ 
                error: "Некорректные данные",
                details: parsed.error.flatten().fieldErrors,
            });
            return;
        }

        const userId = req.userId as string;
        const { title, category, categoryId, ingredients, steps, time, servings, sourceUrl, source, media, tags } = parsed.data;

        let resolvedCategoryId: string | null = categoryId ?? null;

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
                steps: JSON.stringify(steps),
                time: time || null,
                servings: servings ?? null,
                sourceUrl: sourceUrl || "",
                source: source || "other",
                media: {
                    create: media.map((m, i) => ({
                        url: m.url,
                        type: m.type,
                        order: i,
                    })),
                },
                tags: {
                    create: await resolveTags(tags, userId),
                },
            },
            include: {
                category: true,
                media: true,
                tags: { include: { tag: true } },
            },
        });

        res.status(201).json(recipe);
    } catch (error) {
        next(error);
    }
});

// PATCH /api/recipes/:id
router.patch("/:id", validateId, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const parsed = updateRecipeSchema.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({
                error: "Некорректные данные",
                details: parsed.error.flatten().fieldErrors,
            });
            return;
        }

        const userId = req.userId as string;
        const id = req.params.id as string;
        const { title, category, categoryId, ingredients, steps, time, servings, tags } = parsed.data;

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
                ...(servings !== undefined && { servings: servings ?? null }),
            },
        });

        if (tags !== undefined) {
            const resolvedTags = await resolveTags(tags, userId);
            await prisma.recipeTag.createMany({
                data: resolvedTags.map((t: { tagId: string }) => ({ recipeId: id, tagId: t.tagId })),
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
    } catch (error) {
        next(error);
    }
});

// DELETE /api/recipes/:id
router.delete("/:id", validateId, async (req: Request, res: Response, next: NextFunction) => {
    try {
        await prisma.recipe.deleteMany({
            where: {
                id: req.params.id as string,
                userId: req.userId,
            },
        });

        res.json({ ok: true });    
    } 
    catch (error) {
        next(error);
    }
});

async function resolveTags(tagIds: string[], userId: string) {
    const userTags = await prisma.tag.findMany({
        where: {
            userId,
            id: { in: tagIds },
        },
    });

    return userTags.map((tag: { id: string }) => ({ tagId: tag.id }));
}

export default router;