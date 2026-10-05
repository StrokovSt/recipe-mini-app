import { NextFunction, Request, Response } from "express";

export const errorHandler = (error: unknown, _req: Request, res: Response, _next: NextFunction) => {
    console.error("Unhandled error:", error);

    if (error instanceof Error) {
        if (error.message.includes("Record to update not found")) {
            res.status(404).json({ error: "Запись не найдена" });
            return;
        }

        if (error.message.includes("Unique constraint")) {
            res.status(409).json({ error: "Такая запись уже существует" });
            return;
        }
    }

    res.status(500).json({ error: "Внутренняя ошибка сервера" });
};