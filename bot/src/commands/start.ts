import { type Context } from "grammy";

export async function startCommand(ctx: Context) {
    const name = ctx.from?.first_name ?? "друг";

    await ctx.reply(
        `Привет, ${name}! 👋\n\n` +
        `Я помогу тебе сохранять рецепты из Pinterest, фото и постов.\n\n` +
        `*Что я умею:*\n` +
        `🍳 /add — добавить рецепт (ссылка, фото, пост)\n` +
        `📚 /recipes — мои рецепты\n` +
        `❓ /help — помощь\n`,
        {
            parse_mode: "Markdown",
            reply_markup: { remove_keyboard: true },
        }
    );
}