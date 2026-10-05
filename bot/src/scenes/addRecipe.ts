import { type Conversation } from "@grammyjs/conversations";

import type { MediaInput, ParsedRecipe } from "@recipe/common";

import { parseFromImage, parseFromText, parseFromUrl, saveRecipe, uploadToTelegraph } from "../services/api";
import { COMMANDS } from "../shared/lib/constants";
import { MyContext } from "../shared/types";

type MyConversation = Conversation<MyContext, MyContext>;

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
        let parsed: ParsedRecipe | undefined;
        const media: MediaInput[] = [];
        const token = process.env.TELEGRAM_TOKEN!;

        if (msg.photo) {
            const photo = msg.photo[msg.photo.length - 1];
            const { buffer, mimeType } = await getFileBuffer(photo.file_id, token);
            const url = await uploadToTelegraph(buffer, mimeType);
            media.push({ url, type: "image" });
        }
        else if (msg.video) {
            const { buffer, mimeType } = await getFileBuffer(msg.video.file_id, token);
            const url = await uploadToTelegraph(buffer, mimeType);
            media.push({ url, type: "video" });
        }
        else if (msg.document && msg.document.mime_type?.startsWith("video/")) {
            const { buffer, mimeType } = await getFileBuffer(msg.document.file_id, token);
            const url = await uploadToTelegraph(buffer, mimeType);
            media.push({ url, type: "video" });
        }

        const text = msg.text ?? msg.caption ?? "";
        const urlMatch = text.match(/https?:\/\/[^\s]+/);

        if (urlMatch) {
            parsed = await parseFromUrl(urlMatch[0], userId, media);

            if (parsed.media && parsed.media.length > 0) {
                media.push(...parsed.media);
            }
        } 
        else if (text.length > 30) {
            parsed = await parseFromText(text, userId);
        }
        else if (msg.photo) {
            const photo = msg.photo[msg.photo.length - 1];
            const { buffer, mimeType } = await getFileBuffer(photo.file_id, token);
            const base64 = Buffer.from(buffer).toString("base64");
            parsed = await parseFromImage(base64, mimeType, userId);
        }

        if (!parsed) {
            throw new Error("Не удалось распознать рецепт. Попробуй отправить ссылку или четкое описание.");
        }

        const uniqueMedia = Array.from(new Map(media.map(m => [m.url, m])).values());
        const saved = await saveRecipe({ ...parsed, media: uniqueMedia }, userId);
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

    } 
    catch (error) {
        console.error(error);
        const errMsg = error instanceof Error ? error.message : "Неизвестная ошибка";
        await ctx.reply(`❌ Ошибка: ${errMsg}`);
    }
}