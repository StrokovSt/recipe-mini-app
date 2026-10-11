import { z } from "zod";

// Данные формы храним как есть, ограничиваем только размер
const MAX_DATA_LENGTH = 200_000;

const dataSchema = z.unknown().refine(
    (data) => data !== undefined && JSON.stringify(data).length <= MAX_DATA_LENGTH,
    { message: "Слишком большой черновик" },
);

const titleSchema = z.string().trim().max(100);

export const createDraftSchema = z.object({
    title: titleSchema.default(""),
    origin: z.enum(["ai", "manual"]),
    source: z.enum(["pinterest", "telegram", "other"]).default("other"),
    data: dataSchema,
});

export const updateDraftSchema = z.object({
    title: titleSchema.optional(),
    data: dataSchema.optional(),
});
