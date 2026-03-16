import { type Conversation } from "@grammyjs/conversations";

import { parseFromImage, parseFromText, parseFromUrl, saveRecipe } from "../services/api";
import { COMMANDS } from "../shared/lib/constants";
import { MyContext } from "../shared/types";

type MyConversation = Conversation<MyContext, MyContext>;

function isUrl(text: string): boolean {
    return text.startsWith("http://") || text.startsWith("https://");
}

async function getImageBase64(fileId: string, token: string): Promise<{ base64: string; mimeType: string }> {
    const fileRes = await fetch(`https://api.telegram.org/bot${token}/getFile?file_id=${fileId}`);
    const fileData = await fileRes.json() as { result: { file_path: string } };
    const filePath = fileData.result.file_path;

    const imageRes = await fetch(`https://api.telegram.org/file/bot${token}/${filePath}`);
    const buffer = await imageRes.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");

    const ext = filePath.split(".").pop()?.toLowerCase();
    const mimeType = ext === "jpg" || ext === "jpeg" ? "image/jpeg" : "image/png";

    return { base64, mimeType };
}

export async function addRecipeConversation(conversation: MyConversation, ctx: MyContext) {
    const userId = ctx.from?.id?.toString();
    if (!userId) return;

    await ctx.reply(
        "Отправь мне:\n" +
        "🔗 Ссылку на Pinterest\n" +
        "📸 Фотографию рецепта\n" +
        "📝 Пересланный пост из канала\n\n" +
        "Или напиши /cancel для отмены"
    );

    const { message: msg } = await conversation.wait();

    if (!msg) return;

    if (msg.text === "/cancel" || msg.text === `/${COMMANDS.cancel}`) {
        await ctx.reply("Отменено ✓");
        return;
    }

    await ctx.reply("⏳ Обрабатываю...");

    try {
        let parsed;

        if (msg?.photo) {
            const photos = msg.photo;
            const photo = photos[photos.length - 1];
            const token = process.env.TELEGRAM_TOKEN!;
            const { base64, mimeType } = await getImageBase64(photo.file_id, token);
            parsed = await parseFromImage(base64, mimeType, userId);
        } else if (msg?.text && isUrl(msg.text)) {
            parsed = await parseFromUrl(msg.text, userId);
        } else if (msg?.video || msg?.document) {
            const text = msg.caption ?? "";
            if (text.length > 30) {
                parsed = await parseFromText(text, userId);
            } else {
                await ctx.reply("❌ В посте нет текста рецепта. Попробуй отправить ссылку или фото.");
                return;
            }
        } else if (msg?.text || msg?.caption) {
            const text = msg.text ?? msg.caption ?? "";
            const urlMatch = text.match(/https?:\/\/[^\s]+/);
            if (urlMatch) {
                parsed = await parseFromUrl(urlMatch[0], userId);
            } else if (text.length > 30) {
                parsed = await parseFromText(text, userId);
            } else {
                await ctx.reply("❌ Не смог найти рецепт. Попробуй отправить ссылку или фото.");
                return;
            }
        } else {
            await ctx.reply("❌ Не понял что ты отправил. Попробуй ссылку или фото.");
            return;
        }

        const saved = await saveRecipe(parsed, userId);
        const appUrl = process.env.APP_URL!;
        const recipeUrl = `${appUrl}?recipe=${saved.id}`;

        await ctx.reply(
            `✅ Рецепт сохранён!\n\n` +
            `*${parsed.title}*\n` +
            `${parsed.time ? `⏱ ${parsed.time}` : ""} ${parsed.servings ? `👤 ${parsed.servings} порц.` : ""}`,
            {
                parse_mode: "Markdown",
                reply_markup: {
                    inline_keyboard: [[
                        { text: "🍳 Открыть рецепт", web_app: { url: recipeUrl } },
                    ]],
                },
            }
        );

    } catch (error) {
        const msg = error instanceof Error ? error.message : "Неизвестная ошибка";
        await ctx.reply(`❌ Ошибка: ${msg}`);
    }
}