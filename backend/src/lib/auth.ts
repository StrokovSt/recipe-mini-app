import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";

import prisma from "./prisma";

// Вход на сайте. Адрес — сайт, а не бэкенд: /api проксируется на бэкенд, и кука получается «своей» для сайта
export const auth = betterAuth({
    baseURL: process.env.BETTER_AUTH_URL,
    secret: process.env.BETTER_AUTH_SECRET,
    trustedOrigins: process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : [],
    database: prismaAdapter(prisma, { provider: "postgresql" }),
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        },
    },
    // Сессия хранится ещё и в подписанной куке: запросы не ходят в базу за сессией. Раз в 5 минут кука сверяется с базой
    session: {
        cookieCache: {
            enabled: true,
            maxAge: 5 * 60,
        },
    },
    account: {
        accountLinking: {
            enabled: true,
            // У входа через Телеграм служебный email, поэтому Google с любой почтой можно привязать
            allowDifferentEmails: true,
        },
    },
});
