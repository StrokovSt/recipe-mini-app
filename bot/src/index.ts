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

type SessionData = Record<string, never>;

const token = process.env.TELEGRAM_TOKEN;
if (!token) throw new Error("TELEGRAM_TOKEN не задан");

const bot = new Bot<MyContext>(token);

bot.use(session({ initial: (): SessionData => ({}) }));
bot.use(conversations<MyContext, MyContext>());
bot.use(createConversation(addRecipeConversation));

bot.command(COMMANDS.add, (ctx) => ctx.conversation.enter(CONVERSATIONS.addRecipe));
bot.command(COMMANDS.start, startCommand);
bot.command(COMMANDS.help, helpCommand);
bot.command(COMMANDS.recipes, recipesCommand);
bot.command(COMMANDS.cancel, (ctx) => ctx.reply("Нечего отменять"));

bot.catch((err) => {
    console.error("Bot error:", err.message);
});

const PORT = process.env.PORT || 3001;
const WEBHOOK_URL = process.env.WEBHOOK_URL;

const app = express();
app.use(express.json());

app.get("/health", (_req, res) => {
    res.json({ ok: true });
});

app.use("/webhook", webhookCallback(bot, "express"));

app.listen(PORT, async () => {
    console.log(`Сервер запущен на порту ${PORT}`);

    if (WEBHOOK_URL) {
        await bot.api.setWebhook(`${WEBHOOK_URL}/webhook`);
        await bot.api.setMyCommands([
            { command: COMMANDS.start, description: "Начать работу" },
            { command: COMMANDS.add, description: "Добавить рецепт" },
            { command: COMMANDS.recipes, description: "Мои рецепты" },
            { command: COMMANDS.help, description: "Помощь" },
        ]);
        console.log(`Webhook установлен: ${WEBHOOK_URL}/webhook`);
    } else {
        console.log("WEBHOOK_URL не задан — запускаю polling");
        bot.start({
            allowed_updates: ["message", "callback_query"],
        });
    }
});