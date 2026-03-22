import { type Conversation } from "@grammyjs/conversations";

import type { MediaInput } from "@recipe/common";

import { parseFromImage, parseFromText, parseFromUrl, saveRecipe, uploadToTelegraph } from "../services/api";
import { COMMANDS } from "../shared/lib/constants";
import { MyContext } from "../shared/types";

type MyConversation = Conversation<MyContext, MyContext>;

function isUrl(text: string): boolean {
    return text.startsWith("http://") || text.startsWith("https://");
}

async function getFileBuffer(fileId: string, token: string): Promise<{ buffer: ArrayBuffer; mimeType: string }> {
    const fileRes = await fetch(`https://api.telegram.org/bot${token}/getFile?file_id=${fileId}`);
    const fileData = await fileRes.json() as { result: { file_path: string } };
    const filePath = fileData.result.file_path;

    const fileRes2 = await fetch(`https://api.telegram.org/file/bot${token}/${filePath}`);
    const buffer = await fileRes2.arrayBuffer();

    const ext = filePath.split(".").pop()?.toLowerCase();
    let mimeType = "image/jpeg";
    if (ext === "png") mimeType = "image/png";
    else if (ext === "mp4") mimeType = "video/mp4";
    else if (ext === "mov") mimeType = "video/quicktime";
    else if (ext === "webm") mimeType = "video/webm";

    return { buffer, mimeType };
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
        const media: MediaInput[] = [];
        const token = process.env.TELEGRAM_TOKEN!;

        if (msg.photo) {
            // Фото — загружаем в Telegraph и парсим через AI
            const photo = msg.photo[msg.photo.length - 1];
            const { buffer, mimeType } = await getFileBuffer(photo.file_id, token);

            const telegraphUrl = await uploadToTelegraph(buffer, mimeType);
            media.push({ url: telegraphUrl, type: "image" });

            const base64 = Buffer.from(buffer).toString("base64");
            parsed = await parseFromImage(base64, mimeType, userId);

        } else if (msg.text && isUrl(msg.text)) {
            // Ссылка
            parsed = await parseFromUrl(msg.text, userId);

        } else if (msg.video) {
            // Видео из поста — загружаем в Telegraph
            const { buffer, mimeType } = await getFileBuffer(msg.video.file_id, token);
            const telegraphUrl = await uploadToTelegraph(buffer, mimeType);
            media.push({ url: telegraphUrl, type: "video" });

            // Парсим текст из caption
            const text = msg.caption ?? "";
            if (text.length > 30) {
                parsed = await parseFromText(text, userId);
            } else {
                await ctx.reply("❌ В посте нет текста рецепта. Попробуй отправить ссылку или фото.");
                return;
            }

        } else if (msg.document) {
            // Документ (может быть видео как файл)
            const { buffer, mimeType } = await getFileBuffer(msg.document.file_id, token);
            if (mimeType.startsWith("video/")) {
                const telegraphUrl = await uploadToTelegraph(buffer, mimeType);
                media.push({ url: telegraphUrl, type: "video" });
            }

            const text = msg.caption ?? msg.text ?? "";
            if (text.length > 30) {
                parsed = await parseFromText(text, userId);
            } else {
                await ctx.reply("❌ В посте нет текста рецепта.");
                return;
            }

        } else if (msg.text || msg.caption) {
            // Текст или пост с caption
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

        const saved = await saveRecipe({ ...parsed, media }, userId);
        const appUrl = process.env.APP_URL!;
        const recipeUrl = `${appUrl}/recipe/${saved.id}`;

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
        const errMsg = error instanceof Error ? error.message : "Неизвестная ошибка";
        await ctx.reply(`❌ Ошибка: ${errMsg}`);
    }
}