import { NextFunction, Request, Response, Router } from "express";

import { IngredientGroup, MediaInput, RecipeStep } from "@recipe/common";

import prisma from "../lib/prisma";
import { checkRecipeLimit } from "../middleware/checkLimits";
import { cuidSchema, validateId } from "../middleware/validate";
import { publishRecipeToTelegraph } from "../services/telegraph";
import { getFallbackCategory } from "../services/userDefaults";
import { createRecipeSchema, updateRecipeSchema } from "../validation/recipe";

const router = Router();

function parseRecipe<T extends { ingredients: string; steps: string }>(recipe: T) {
    return {
        ...recipe,
        ingredients: JSON.parse(recipe.ingredients) as IngredientGroup[],
        steps: JSON.parse(recipe.steps) as RecipeStep[],
    };
}

const RECIPE_INCLUDE = {
    category: true,
    media: { orderBy: { order: "asc" } },
    tags: { include: { tag: true } },
} as const;

// GET /api/recipes?categoryId=xxx&tagIds=xxx,yyy&search=карб
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { categoryId, tagIds, search } = req.query;

        // Проверяем categoryId
        if (categoryId) {
            const result = cuidSchema.safeParse(categoryId);

            if (!result.success) {
                res.status(400).json({
                    error: "Некорректный categoryId",
                });
                return;
            }
        }

        // Преобразуем tagIds из строки "tag1,tag2,tag3"
        // в массив ["tag1", "tag2", "tag3"]
        const parsedTagIds =
            typeof tagIds === "string"
                ? tagIds.split(",").filter(Boolean)
                : [];

        // Проверяем каждый tagId
        for (const tagId of parsedTagIds) {
            const result = cuidSchema.safeParse(tagId);

            if (!result.success) {
                res.status(400).json({
                    error: "Некорректный tagId",
                });
                return;
            }
        }

        // Проверяем поисковый запрос
        if (search && (search as string).length > 100) {
            res.status(400).json({
                error: "Слишком длинный поисковый запрос",
            });
            return;
        }

        const recipes = await prisma.recipe.findMany({
            where: {
                userId: req.userId,

                // Фильтр по категории
                ...(categoryId
                    ? {
                        categoryId: categoryId as string,
                    }
                    : {}),

                // Фильтр по нескольким тегам
                ...(parsedTagIds.length > 0
                    ? {
                        AND: parsedTagIds.map((tagId) => ({
                            tags: {
                                some: {
                                    tagId,
                                },
                            },
                        })),
                    }
                    : {}),

                // Поиск по названию
                ...(search
                    ? {
                        title: {
                            contains: search as string
                        },
                    }
                    : {}),
            },

            include: RECIPE_INCLUDE,

            orderBy: {
                createdAt: "desc",
            },
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
            include: RECIPE_INCLUDE,
        });

        if (!recipe) {
            res.status(404).json({ error: "Рецепт не найден" });
            return;
        }

        res.json(parseRecipe(recipe));    
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
        const { title, description, categoryId, ingredients, steps, prepTime, cookTime, servings, sourceUrl, source, media, tags } = parsed.data;

        const recipe = await prisma.recipe.create({
            data: {
                userId,
                title,
                description: description || null,
                categoryId: await resolveCategoryId(categoryId, userId),
                ingredients: JSON.stringify(ingredients),
                steps: JSON.stringify(steps),
                prepTime: prepTime ?? null,
                cookTime: cookTime ?? null,
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
            include: RECIPE_INCLUDE,
        });

        publishRecipeToTelegraph({
            title,
            description,
            ingredients,
            steps,
            prepTime,
            cookTime,
            servings,
            media: recipe.media as MediaInput[],
            sourceUrl,
        })
        .then(async (telegraphUrl) => {
            console.log("Telegraph published:", telegraphUrl);
            await prisma.recipe.update({
                where: { id: recipe.id },
                data: { telegraphUrl },
            });
        })
        .catch((err) => {
            console.error("Telegraph publish error:", err.message);
        });

        res.status(201).json(parseRecipe(recipe));
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
        const { title, description, categoryId, ingredients, steps, prepTime, cookTime, servings, media, tags } = parsed.data;

        const existing = await prisma.recipe.findFirst({ where: { id, userId }, select: { id: true } });

        if (!existing) {
            res.status(404).json({ error: "Рецепт не найден" });
            return;
        }

        const resolvedTags = tags !== undefined ? await resolveTags(tags, userId) : undefined;

        const updated = await prisma.recipe.update({
            where: { id },
            data: {
                ...(title && { title }),
                ...(description !== undefined && { description: description || null }),
                ...(categoryId !== undefined && { categoryId: await resolveCategoryId(categoryId, userId) }),
                ...(ingredients && { ingredients: JSON.stringify(ingredients) }),
                ...(steps && { steps: JSON.stringify(steps) }),
                ...(prepTime !== undefined && { prepTime }),
                ...(cookTime !== undefined && { cookTime }),
                ...(servings !== undefined && { servings }),
                // Медиа и теги заменяются целиком
                ...(media && {
                    media: {
                        deleteMany: {},
                        create: media.map((m, i) => ({ url: m.url, type: m.type, order: i })),
                    },
                }),
                ...(resolvedTags && {
                    tags: {
                        deleteMany: {},
                        create: resolvedTags,
                    },
                }),
            },
            include: RECIPE_INCLUDE,
        });

        res.json(parseRecipe(updated));
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

// Категория должна принадлежать пользователю, иначе рецепт попадает в «Разное»
async function resolveCategoryId(categoryId: string | null | undefined, userId: string) {
    if (categoryId) {
        const category = await prisma.category.findFirst({ where: { id: categoryId, userId } });
        if (category) return category.id;
    }

    const fallback = await getFallbackCategory(userId);
    return fallback.id;
}

// Только существующие теги пользователя, новые не создаются
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