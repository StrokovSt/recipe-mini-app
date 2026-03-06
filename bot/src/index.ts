import "dotenv/config";

import { Bot } from "grammy";

const token = process.env.TELEGRAM_TOKEN;
if (!token) throw new Error("TELEGRAM_TOKEN не задан");

const appUrl = process.env.APP_URL ?? "https://recipe-mini-app-frontend.netlify.app";

const bot = new Bot(token);

bot.command("start", async (ctx) => {
    await ctx.reply("Привет! Открывай свою коллекцию рецептов 👇", {
        reply_markup: {
        inline_keyboard: [[
            {
                text: "🍳 Мои рецепты",
                web_app: { url: appUrl }
            }
        ]]
        }
    });
});

bot.start();
console.log("Бот запущен");