import type { IngredientGroup, MediaType, RecipeStep } from "@recipe/common";

import { createPage, editPage } from "../api/telegraph";
import { formatIngredient } from "../utils/formatIngredient";

interface MediaInput {
    url: string;
    type: MediaType | string;
}

interface RecipePageData {
    title: string;
    description?: string | null;
    ingredients: IngredientGroup[];
    steps: RecipeStep[];
    prepTime?: number | null;
    cookTime?: number | null;
    servings?: number | null;
    calories?: number | null;
    protein?: number | null;
    fat?: number | null;
    carbs?: number | null;
    media?: MediaInput[];
    sourceUrl?: string;
}

function buildContent(recipe: RecipePageData) {
    const content = [];

    // Фото/видео
    if (recipe.media && recipe.media.length > 0) {
        const video = recipe.media?.find(m => m.type === "video" || m.type.startsWith("video/"));
        const image = recipe.media?.find(m => m.type === "image" || m.type.startsWith("image/"));

        if (image) {
            content.push({
                tag: "figure",
                children: [{
                    tag: "img",
                    attrs: { src: image.url },
                }],
            });
        }

        if (video) {
            content.push({
                tag: "figure",
                children: [{
                    tag: "video",
                    attrs: { src: video.url },
                }],
            });
        }
    }

    if (recipe.description) {
        content.push({ tag: "p", children: [recipe.description] });
    }

    // Мета информация
    if (recipe.prepTime || recipe.cookTime || recipe.servings) {
        const meta = [];
        if (recipe.prepTime) meta.push(`🔪 подготовка ${recipe.prepTime} мин`);
        if (recipe.cookTime) meta.push(`⏱ готовка ${recipe.cookTime} мин`);
        if (recipe.servings) meta.push(`👤 ${recipe.servings} порц.`);
        content.push({
            tag: "p",
            children: [meta.join("  |  ")],
        });
    }

    // КБЖУ на порцию: показываем, только если известны калории
    if (recipe.calories) {
        const macros = [
            recipe.protein !== null && recipe.protein !== undefined && `Б ${recipe.protein}`,
            recipe.fat !== null && recipe.fat !== undefined && `Ж ${recipe.fat}`,
            recipe.carbs !== null && recipe.carbs !== undefined && `У ${recipe.carbs} г`,
        ].filter(Boolean);
        content.push({
            tag: "p",
            children: [[`🔥 ≈ ${recipe.calories} ккал на порцию`, ...macros].join("  ·  ")],
        });
    }

    // Ингредиенты, если есть
    if (recipe.ingredients.length > 0) {
        content.push({ tag: "h3", children: ["Ингредиенты"] });
    }

    for (const group of recipe.ingredients) {
        if (group.title) {
            content.push({ tag: "h4", children: [group.title] });
        }
        content.push({
            tag: "ul",
            children: group.items.map(item => ({
                tag: "li",
                children: [formatIngredient(item)],
            })),
        });
    }

    // Шаги: номер и текст, под шагом его фото
    if (recipe.steps.length > 0) {
        content.push({ tag: "h3", children: ["Приготовление"] });

        recipe.steps.forEach((step, i) => {
            content.push({
                tag: "p",
                children: [{ tag: "b", children: [`${i + 1}.`] }, ` ${step.text}`],
            });

            for (const src of step.images) {
                content.push({
                    tag: "figure",
                    children: [{ tag: "img", attrs: { src } }],
                });
            }
        });
    }

    // Источник
    if (recipe.sourceUrl) {
        content.push({
            tag: "p",
            children: [{
                tag: "a",
                attrs: { href: recipe.sourceUrl },
                children: ["Источник рецепта"],
            }],
        });
    }

    return content;
}

// Новый рецепт — новая страница. Есть pageUrl (правка рецепта) — обновляем ту же страницу,
// чтобы ссылка, которой уже поделились, показывала свежую версию
export async function publishRecipeToTelegraph(recipe: RecipePageData, pageUrl?: string | null): Promise<string> {
    const accessToken = process.env.TELEGRAPH_TOKEN;
    if (!accessToken) throw new Error("TELEGRAPH_TOKEN не задан");

    const content = buildContent(recipe);
    if (pageUrl) {
        const page = await editPage(accessToken, new URL(pageUrl).pathname.slice(1), recipe.title, content);
        return page.url;
    }

    const page = await createPage(accessToken, recipe.title, content);
    return page.url;
}