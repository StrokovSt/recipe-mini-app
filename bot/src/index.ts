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
    app.use("/webhook", webhookCallback(bot, "express"));
    
    app.listen(PORT, "0.0.0.0", async () => {
        console.log(`Бот слушает порт ${PORT} (WEBHOOK MODE)`);
        try {
            await bot.api.setWebhook(`${WEBHOOK_URL}/webhook`);
            console.log(`Webhook успешно установлен на: ${WEBHOOK_URL}/webhook`);
        } catch (e) {
            console.error("Ошибка установки вебхука:", e);
        }
    });
} else {
    app.listen(PORT, () => {
        console.log(`Health check на порту ${PORT}`);
        bot.start({
            onStart: () => console.log("Бот запущен (POLLING MODE)"),
            allowed_updates: ["message", "callback_query"],
        });
    });
}