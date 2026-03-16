import "dotenv/config";

import { conversations, createConversation } from "@grammyjs/conversations";
import express from "express";
import { Bot, session, webhookCallback } from "grammy";

import { helpCommand } from "./commands/help";
import { recipesCommand } from "./commands/recipes";
import { startCommand } from "./commands/start";
import { addRecipeConversation } from "./scenes/addRecipe";
import { COMMANDS, CONVERSATIONS } from "./shared/lib/constants";
import { MyContext } from "./shared/types";

const token = process.env.TELEGRAM_TOKEN;
if (!token) throw new Error("TELEGRAM_TOKEN не задан");

const bot = new Bot<MyContext>(token);

// 1. Сессии (обязательно перед conversations)
bot.use(session({ initial: () => ({}) }));
bot.use(conversations());
bot.use(createConversation(addRecipeConversation));

// 2. Команды
bot.command(COMMANDS.add, (ctx) => ctx.conversation.enter(CONVERSATIONS.addRecipe));
bot.command(COMMANDS.start, startCommand);
bot.command(COMMANDS.help, helpCommand);
bot.command(COMMANDS.recipes, recipesCommand);
bot.command(COMMANDS.cancel, async (ctx) => {
    await ctx.conversation.exit(CONVERSATIONS.addRecipe); 
    await ctx.reply("Действие отменено ✓");
});

bot.catch((err) => {
    console.error("Bot error:", err.message);
});

const PORT = Number(process.env.PORT) || 3001;
const WEBHOOK_URL = process.env.WEBHOOK_URL;

const app = express();
app.use(express.json());

app.get("/health", (_req, res) => res.json({ ok: true }));

if (WEBHOOK_URL) {
    // Режим Webhook (для продакшена)
    app.use("/webhook", webhookCallback(bot, "express"));
    app.listen(PORT, async () => {
        console.log(`Сервер (Webhook) запущен на порту ${PORT}`);
        await bot.api.setWebhook(`${WEBHOOK_URL}/webhook`);
        console.log(`Webhook установлен: ${WEBHOOK_URL}/webhook`);
    });
} else {
    // Режим Polling (для локальной разработки)
    app.listen(PORT, () => {
        console.log(`Сервер (Health check) запущен на порту ${PORT}`);
        bot.start({
            onStart: () => console.log("Бот запущен через Long Polling"),
            allowed_updates: ["message", "callback_query"],
        });
    });
}