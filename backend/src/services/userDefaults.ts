import { DEFAULT_CATEGORIES, DEFAULT_TAGS, FALLBACK_CATEGORY } from "../config/defaults";
import prisma from "../lib/prisma";

// Резервная категория «Разное». Ищем по флагу, а не по имени: её можно переименовать
export async function getFallbackCategory(userId: string) {
    const existing = await prisma.category.findFirst({ where: { userId, isDefault: true } });
    if (existing) return existing;

    // upsert на случай, если у пользователя уже есть своя категория с таким именем
    return prisma.category.upsert({
        where: { userId_name: { userId, name: FALLBACK_CATEGORY.name } },
        update: { isDefault: true },
        create: { userId, ...FALLBACK_CATEGORY, isDefault: true },
    });
}

// Новому пользователю создаём стандартные категории, «Разное» есть у всех всегда
export async function ensureCategories(userId: string) {
    const count = await prisma.category.count({ where: { userId } });

    if (count === 0) {
        await prisma.category.createMany({
            data: DEFAULT_CATEGORIES.map((category) => ({ userId, ...category })),
        });
    }

    await getFallbackCategory(userId);
}

// Стандартные теги появляются, пока у пользователя нет ни одного
export async function ensureTags(userId: string) {
    const count = await prisma.tag.count({ where: { userId } });
    if (count > 0) return;

    await prisma.tag.createMany({
        data: DEFAULT_TAGS.map((name) => ({ userId, name })),
    });
}
