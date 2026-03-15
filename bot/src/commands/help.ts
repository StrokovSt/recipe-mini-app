import { type Context } from "grammy";

export async function helpCommand(ctx: Context) {
    await ctx.reply(
        `*Как пользоваться ботом:*\n\n` +
        `*Добавить рецепт* — /add\n` +
        `Отправь ссылку на Pinterest, фото рецепта или перешли пост из кулинарного канала — я сам разберусь что это и сохраню рецепт.\n\n` +
        `*Мои рецепты* — /recipes\n` +
        `Список твоих рецептов с кнопкой открыть коллекцию.\n\n` +
        `*Открыть приложение* — нажми кнопку ниже\n`,
        {
            parse_mode: "Markdown",
            reply_markup: {
                inline_keyboard: [[
                    { text: "📖 Открыть коллекцию", web_app: { url: process.env.APP_URL! } },
                ]],
            },
        }
    );
}