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
            await ctx.reply(
                "У тебя пока нет рецептов.\n\nДобавь первый с помощью /add",
            );
            return;
        }

        const preview = recipes.slice(0, 5);

        let text = `📚 *Твои рецепты* (${recipes.length}):\n\n`;
        preview.forEach((r, i) => {
            text += `${i + 1}. ${r.title}`;
            if (r.time) text += ` ⏱${r.time}`;
            if (r.category) text += ` · ${r.category.name}`;
            text += "\n";
        });

        if (recipes.length > 5) {
            text += `\n_...и ещё ${recipes.length - 5} рецептов_`;
        }

        await ctx.reply(text, {
            parse_mode: "Markdown",
            reply_markup: new InlineKeyboard()
                .webApp("📖 Открыть все рецепты", appUrl),
        });

    } catch {
        await ctx.reply("❌ Не удалось загрузить рецепты");
    }
}