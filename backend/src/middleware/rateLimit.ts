import rateLimit from "express-rate-limit";

// Общий лимит — 100 запросов за 15 минут
export const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { error: "Слишком много запросов, попробуй позже" },
    standardHeaders: true,
    legacyHeaders: false,
});

// Лимит для парсинга — 10 запросов за 15 минут
export const parseLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { error: "Слишком много запросов к парсеру, попробуй позже" },
    standardHeaders: true,
    legacyHeaders: false,
});

// Лимит для загрузки файлов — 20 запросов за 15 минут
export const uploadLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: { error: "Слишком много загрузок, попробуй позже" },
    standardHeaders: true,
    legacyHeaders: false,
});