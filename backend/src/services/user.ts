import prisma from "../lib/prisma";

// Пользователь создаётся при первом обращении: id приходит из Telegram
export function ensureUser(userId: string) {
    return prisma.user.upsert({
        where: { id: userId },
        update: {},
        create: { id: userId },
    });
}
