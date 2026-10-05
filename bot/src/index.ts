import "dotenv/config";

import { conversations, createConversation } from "@grammyjs/conversations";
import express from "express";
import { Bot, session } from "grammy";

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

const app = express();
app.use(express.json());

app.get("/health", (_req, res) => res.json({ ok: true }));

app.listen(PORT, () => {
    console.log(`Health check на порту ${PORT}`);
});

bot.start({
    onStart: async (botInfo) => {
        console.log(`Бот запущен: @${botInfo.username}`);
        await bot.api.setMyCommands([
            { command: COMMANDS.start, description: "Начать работу" },
            { command: COMMANDS.add, description: "Добавить рецепт" },
            { command: COMMANDS.recipes, description: "Мои рецепты" },
            { command: COMMANDS.help, description: "Помощь" },
        ]);
        // Убираем webhook если он был установлен
        await bot.api.deleteWebhook();
    },
    allowed_updates: ["message", "callback_query"],
});