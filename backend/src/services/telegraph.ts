import type { IngredientGroup, MediaType } from "@recipe/common";

import { createPage } from "../api/telegraph";

interface MediaInput {
    url: string;
    type: MediaType | string;
}

interface RecipePageData {
    title: string;
    ingredients: IngredientGroup[];
    steps: string[];
    time?: string | null;
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

    // Мета информация
    if (recipe.time || recipe.servings) {
        const meta = [];
        if (recipe.time) meta.push(`⏱ ${recipe.time}`);
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
                children: [item],
            })),
        });
    }

    // Шаги
    if (recipe.steps.length > 0) {
        content.push({ tag: "h3", children: ["Приготовление"] });
        content.push({
            tag: "ol",
            children: recipe.steps.map(step => ({
                tag: "li",
                children: [step],
            })),
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