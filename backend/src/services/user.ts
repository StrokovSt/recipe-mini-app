import { Prisma } from "@prisma/client";
import { randomUUID } from "crypto";

import type { AuthProvider } from "@recipe/common";

import prisma from "../lib/prisma";

// Пользователь Телеграма из initData. У бота есть только id
export interface TelegramUser {
    id: number | string;
    first_name?: string;
    last_name?: string;
    photo_url?: string;
}

export function getUser(userId: string) {
    return prisma.user.findUniqueOrThrow({ where: { id: userId } });
}

// Telegram id → id аккаунта. Мини-апп подписывает каждый запрос, и без памяти каждый шёл бы в базу.
// Связь меняется, только когда аккаунт удаляют (deleteUserData)
const telegramUserIds = new Map<string, string>();

const findTelegramAccount = (accountId: string) =>
    prisma.account.findUnique({
        where: { providerId_accountId: { providerId: "telegram", accountId } },
        select: { userId: true },
    });

// Аккаунт по Телеграму. Нет такого — создаём пользователя со способом входа «Телеграм»
export async function getTelegramUserId(telegramUser: TelegramUser): Promise<string> {
    const accountId = String(telegramUser.id);

    const cached = telegramUserIds.get(accountId);
    if (cached) return cached;

    const account = await findTelegramAccount(accountId);
    if (account) {
        telegramUserIds.set(accountId, account.userId);
        return account.userId;
    }

    const name = [telegramUser.first_name, telegramUser.last_name].filter(Boolean).join(" ");

    try {
        const user = await prisma.user.create({
            data: {
                id: randomUUID(),
                name,
                email: `${accountId}@telegram.invalid`,
                image: telegramUser.photo_url,
                accounts: { create: { id: randomUUID(), providerId: "telegram", accountId } },
            },
        });
        return user.id;
    }
    catch (error) {
        // Первые запросы мини-аппа приходят разом: аккаунт уже создал соседний запрос
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
            const created = await findTelegramAccount(accountId);
            if (created) return created.userId;
        }
        throw error;
    }
}

// Отвязать способ входа. Последний не отвязывается: в аккаунт было бы не войти
export async function unlinkProvider(userId: string, provider: AuthProvider): Promise<boolean> {
    const accounts = await prisma.account.findMany({ where: { userId }, select: { providerId: true, accountId: true } });
    const account = accounts.find(({ providerId }) => providerId === provider);
    if (!account || accounts.length < 2) return false;

    await prisma.account.deleteMany({ where: { userId, providerId: provider } });
    if (provider === "telegram") telegramUserIds.delete(account.accountId);
    return true;
}

// Удаление аккаунта: рецепты, разделы, теги, черновики, сессии и способы входа
export function deleteUserData(userId: string) {
    telegramUserIds.forEach((id, accountId) => {
        if (id === userId) telegramUserIds.delete(accountId);
    });

    return prisma.$transaction([
        prisma.recipe.deleteMany({ where: { userId } }),
        prisma.category.deleteMany({ where: { userId } }),
        prisma.tag.deleteMany({ where: { userId } }),
        prisma.draft.deleteMany({ where: { userId } }),
        prisma.user.delete({ where: { id: userId } }),
    ]);
}
