import { type Context } from "grammy";
import { InlineKeyboard } from "grammy";

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

        const keyboard = new InlineKeyboard();

        recipes.slice(0, 10).forEach((r) => {
            const label = `${r.title}${r.time ? ` ⏱${r.time}` : ""}`;
            keyboard.webApp(label, `${appUrl}/recipe/${r.id}`).row();
        });

        if (recipes.length > 10) {
            keyboard.webApp(`📖 Все рецепты (${recipes.length})`, appUrl).row();
        }

        await ctx.reply(`📚 *Твои рецепты* (${recipes.length}):`, {
            parse_mode: "Markdown",
            reply_markup: keyboard,
        });

    } catch (error) {
        console.error("recipesCommand error:", error);
        await ctx.reply("❌ Не удалось загрузить рецепты");
    }
}