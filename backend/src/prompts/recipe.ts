import { type Schema, Type } from "@google/genai";

import { UNIT_CODES } from "@recipe/common";

// Списки пользователя: ИИ выбирает категорию и теги только из них. language — код языка, на котором нужен рецепт
export interface PromptContext {
    categories: string[];
    tags: string[];
    language: string;
}

// Названия языков для промпта. Неизвестный код уходит в промпт как есть
const LANGUAGE_NAMES: Record<string, string> = {
    ru: "Russian",
    en: "English",
    uk: "Ukrainian",
    de: "German",
    fr: "French",
    es: "Spanish",
    it: "Italian",
    pt: "Portuguese",
    tr: "Turkish",
    id: "Indonesian",
    ja: "Japanese",
    ko: "Korean",
    zh: "Simplified Chinese",
};

const UNIT_HINTS = `g, kg, oz, lb — mass; ml, l — volume; tsp — teaspoon; tbsp — tablespoon;
glass — a drinking glass as used in Russian recipes ("стакан", 200–250 ml); cup_us — US cup;
pcs — pieces/whole items; clove; slice; bunch; sprig; can — tin/jar; pack — package/sachet;
pinch; handful; to_taste — "to taste"`;

const nullable = (type: Type): Schema => ({ type, nullable: true });

// Схема ответа: категория и теги — только из списков пользователя, единицы — только наши коды
export const recipeSchema = ({ categories, tags }: PromptContext): Schema => ({
    type: Type.OBJECT,
    properties: {
        title: { type: Type.STRING },
        description: nullable(Type.STRING),
        category: categories.length ? { type: Type.STRING, enum: categories, nullable: true } : nullable(Type.STRING),
        tags: { type: Type.ARRAY, items: tags.length ? { type: Type.STRING, enum: tags } : { type: Type.STRING } },
        servings: nullable(Type.INTEGER),
        prepTime: nullable(Type.INTEGER),
        cookTime: nullable(Type.INTEGER),
        ingredients: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    title: nullable(Type.STRING),
                    items: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                name: { type: Type.STRING },
                                amount: nullable(Type.NUMBER),
                                unit: { type: Type.STRING, enum: [...UNIT_CODES], nullable: true },
                                approx: { type: Type.BOOLEAN },
                            },
                            required: ["name", "amount", "unit", "approx"],
                            propertyOrdering: ["name", "amount", "unit", "approx"],
                        },
                    },
                },
                required: ["title", "items"],
                propertyOrdering: ["title", "items"],
            },
        },
        steps: { type: Type.ARRAY, items: { type: Type.STRING } },
        calories: nullable(Type.INTEGER),
        protein: nullable(Type.INTEGER),
        fat: nullable(Type.INTEGER),
        carbs: nullable(Type.INTEGER),
    },
    required: ["title", "description", "category", "tags", "servings", "prepTime", "cookTime", "ingredients", "steps", "calories", "protein", "fat", "carbs"],
    propertyOrdering: ["title", "description", "category", "tags", "servings", "prepTime", "cookTime", "ingredients", "steps", "calories", "protein", "fat", "carbs"],
});

export const nutritionSchema: Schema = {
    type: Type.OBJECT,
    properties: {
        calories: { type: Type.INTEGER },
        protein: { type: Type.INTEGER },
        fat: { type: Type.INTEGER },
        carbs: { type: Type.INTEGER },
    },
    required: ["calories", "protein", "fat", "carbs"],
};

const sharedRules = ({ categories, tags, language }: PromptContext) => {
    const languageName = LANGUAGE_NAMES[language] ?? language;

    return `
LANGUAGE
- Write title, description, ingredient names, ingredient group titles and steps in ${languageName}. If the source is in another language, translate it naturally, the way a cookbook in ${languageName} would phrase it.
- Never convert amounts or units while translating: "1 cup" stays amount 1, unit "cup_us".

NO RECIPE
- If the source contains no recipe at all (no dish with ingredients or cooking steps), return empty "ingredients" and "steps". Do not invent a recipe.

FIELDS
- title: the dish name, without emojis, hashtags, channel names or words like "recipe". If the source has no name, make one from the dish.
- description: 1–2 sentences about the dish if the source has an intro or description, otherwise null. Do not invent.
- category: exactly one name from the user's categories, or null if none fits.
- tags: 0–5 tags, only from the user's tags, verbatim.
- servings: number of servings if stated, otherwise null.
- prepTime: preparation in minutes (chopping, kneading, marinating) if stated, otherwise null.
- cookTime: cooking in minutes (boiling, frying, baking) if stated. If only one total time is given, put it in cookTime and leave prepTime null.
- steps: cooking steps in order, one action block per step, complete sentences, no numbering. Keep temperatures, times and amounts mentioned in the steps. Split one long paragraph into logical steps. Drop greetings, ads, calls to subscribe and stories unrelated to cooking.
- calories, protein, fat, carbs: per ONE serving, integers (kcal and grams). Take them from the source if given (recalculate to one serving if given per 100 g or for the whole dish). Otherwise estimate from the ingredients and amounts; if servings are not stated, treat the whole dish as one serving. null only if there are no ingredients.

INGREDIENTS
- ingredients: an array of groups. If the source splits ingredients into parts ("For the dough", "For the cream"), make one group per part with its title; otherwise a single group with title null.
- List every ingredient the recipe uses, including ones mentioned only in the steps or only spoken/shown.
- Never list the same ingredient twice in one group. If it is used in different parts of the dish (marinade and sauce), make titled groups for those parts; if it is simply added twice, sum the amounts into one line.
- name: the product only, without amount or unit, lowercase unless a proper noun ("wheat flour", "eggs"). Keep important details in the name: fat content, cut, state ("butter, softened", "cream 33%").
- amount: a number. Fractions as decimals: 1/2 → 0.5, 1 1/2 → 1.5, "half" → 0.5. A range "2–3" → the lower number 2.
- unit: one unit code or null. "2 tbsp" → amount 2, unit "tbsp"; "3 eggs" → amount 3, unit "pcs"; "a pinch of salt" → amount 1, unit "pinch".
- If the unit is not in the list, move it into the name and use the closest code or null: "2 celery stalks" → name "celery, stalks", amount 2, unit null. A weight in brackets wins: "1 can (400 g) tomatoes" → amount 400, unit "g".
- Read the amount carefully: it may stand before or after the product, in a table, in brackets, or be said aloud. Never drop an amount that the source gives.
- approx: false when the amount comes from the source. If the source gives NO amount for an ingredient, you MUST estimate a typical amount for this dish and number of servings, and set approx true. Estimates must be realistic and consistent with each other. A main ingredient (meat, pasta, vegetables, flour) never has amount null.
- "To taste" items (salt, pepper, spices, sugar "to taste", oil "for frying", water "as needed") are not estimated: amount null, unit "to_taste", approx false.

UNIT CODES: ${UNIT_CODES.join(", ")}
${UNIT_HINTS}

USER'S CATEGORIES: ${categories.length ? categories.map((name) => `"${name}"`).join(", ") : "none"}
USER'S TAGS: ${tags.length ? tags.map((name) => `"${name}"`).join(", ") : "none"}
`;
};

export const recipePrompt = (text: string, context: PromptContext) => `
You are a recipe parser. Extract the recipe from the text below.

The text may be a web page, a social media caption, video subtitles (auto-generated, with recognition mistakes and no punctuation) or a mix of them. Ignore noise: site menus, links, @usernames, hashtags, ads, calls to subscribe, comments from other users, other recipes recommended on the page. If the page has several recipes, take the main one.
Look for steps even when they are a plain list without a "Method" heading, and for ingredients even when they are only mentioned inside the steps.
${sharedRules(context)}
TEXT:
${text}
`;

export const recipeImagePrompt = (context: PromptContext) => `
You are a recipe parser. Look at the image and extract the recipe from it. The image may be a screenshot, a photo of a cookbook page or a handwritten card.

Read all text on the image, including small print and tables.
${sharedRules(context)}`;

// text — подпись к видео и субтитры, если есть: количества часто написаны там, а шаги видны в кадре
export const recipeVideoPrompt = (context: PromptContext, text = "") => `
You are a recipe parser. Watch the video and extract the recipe from it.

Watch and listen: take ingredients and amounts from on-screen text and the author's speech, and steps from what happens in the frame. On-screen text is more reliable than speech recognition.
${text ? "The caption and subtitles of the video are given below. Combine them with the video: amounts written in the caption win over what you hear." : ""}
${sharedRules(context)}${text ? `\nCAPTION AND SUBTITLES:\n${text}\n` : ""}`;

export const amountsSchema: Schema = {
    type: Type.OBJECT,
    properties: {
        items: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    index: { type: Type.INTEGER },
                    amount: { type: Type.NUMBER },
                    unit: { type: Type.STRING, enum: [...UNIT_CODES], nullable: true },
                },
                required: ["index", "amount", "unit"],
                propertyOrdering: ["index", "amount", "unit"],
            },
        },
    },
    required: ["items"],
};

// Отдельный запрос за количествами: когда основной ответ оставил ингредиенты без них.
// ingredients — все ингредиенты рецепта по порядку, missing — номера тех, что без количества
export const amountsPrompt = (title: string, servings: number | null, ingredients: string[], missing: number[]) => `
You are an experienced cook. Some ingredients of the dish below have no amount. Estimate a realistic amount and unit for each of them, consistent with the ingredients that already have amounts and with the number of servings.

${servings ? `Servings in the recipe: ${servings}.` : "Servings are not stated: assume 2–4 servings, as usual for such a dish."}
Return one entry for each of these ingredient numbers: ${missing.join(", ")}. "index" is the ingredient number, "amount" is a number greater than 0, "unit" is one of the unit codes (${UNIT_CODES.filter((code) => code !== "to_taste").join(", ")}) or null for countable items without a unit.

Dish: ${title || "untitled"}
Ingredients:
${ingredients.map((line, index) => `${index + 1}. ${line}`).join("\n")}
`;

// Отдельный запрос только за КБЖУ: когда основной ответ пришёл без него
export const nutritionPrompt = (title: string, servings: number | null, ingredients: string[]) => `
You are a nutritionist. Estimate calories (kcal), protein, fat and carbs (grams) of the dish per ONE serving, as integers.

Estimate missing amounts from a usual recipe and a usual serving of such a dish.
${servings ? `Servings in the recipe: ${servings}.` : "Servings are not stated: assume one usual serving."}

Dish: ${title || "untitled"}
Ingredients:
${ingredients.map((line) => `- ${line}`).join("\n")}
`;
