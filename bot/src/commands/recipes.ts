import { type Context, InlineKeyboard } from "grammy";

import { getUserRecipes } from "../services/api";

export async function recipesCommand(ctx: Context) {
    const userId = ctx.from?.id?.toString();
    if (!userId) return;

    const appUrl = process.env.APP_URL!;

    try {
        const recipes = await getUserRecipes(userId);

        if (recipes.length === 0) {
            await ctx.reply("У тебя пока нет рецептов.\n\nДобавь первый с помощью /add");
            return;
        }

        const preview = recipes.slice(0, 8);

        for (const r of preview) {
            const keyboard = new InlineKeyboard();
            keyboard.webApp("🍳 Открыть в приложении", `${appUrl}/recipe/${r.id}`);
            if (r.telegraphUrl) {
                keyboard.url("📝 Открыть в Telegraph", r.telegraphUrl);
            }

            const label = [
                `*${r.title}*`,
                r.time ? `⏱ ${r.time}` : "",
                r.category ? `📁 ${r.category.name}` : "",
            ].filter(Boolean).join("  ");

            await ctx.reply(label, {
                parse_mode: "Markdown",
                reply_markup: keyboard,
            });
        }

        if (recipes.length > 8) {
            await ctx.reply(
                `_...и ещё ${recipes.length - 8} рецептов_`,
                {
                    parse_mode: "Markdown",
                    reply_markup: new InlineKeyboard()
                        .webApp(`📖 Все рецепты (${recipes.length})`, appUrl),
                }
            );
        }

    } catch (error) {
        console.error("recipesCommand error:", error);
        await ctx.reply("❌ Не удалось загрузить рецепты");
    }
}