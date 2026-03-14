// backend/src/scripts/migrate-ingredients.ts
import prisma from "../lib/prisma";

async function main() {
    const recipes = await prisma.recipe.findMany();

    for (const recipe of recipes) {
        const ingredients = JSON.parse(recipe.ingredients);

        // Уже в новом формате — пропускаем
        if (Array.isArray(ingredients) && ingredients[0]?.items) continue;

        // Конвертируем плоский массив в группу
        const migrated = [{ title: null, items: ingredients }];

        await prisma.recipe.update({
            where: { id: recipe.id },
            data: { ingredients: JSON.stringify(migrated) },
        });

        console.log(`Migrated: ${recipe.title}`);
    }

    console.log("Done");
}

main().catch(console.error).finally(() => prisma.$disconnect());