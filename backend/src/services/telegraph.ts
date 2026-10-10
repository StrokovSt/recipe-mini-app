import type { IngredientGroup, MediaType, RecipeStep } from "@recipe/common";

import { createPage } from "../api/telegraph";
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

    // Ингредиенты
    content.push({ tag: "h3", children: ["Ингредиенты"] });

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

export async function publishRecipeToTelegraph(recipe: RecipePageData): Promise<string> {
    const accessToken = process.env.TELEGRAPH_TOKEN;
    if (!accessToken) throw new Error("TELEGRAPH_TOKEN не задан");

    const content = buildContent(recipe);
    const page = await createPage(accessToken, recipe.title, content);
    return page.url;
}