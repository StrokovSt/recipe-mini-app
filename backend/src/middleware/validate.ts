import { NextFunction,Request, Response } from "express";
import { z } from "zod";

export const cuidSchema = z.string().cuid();

export const validateId = (req: Request, res: Response, next: NextFunction) => {
    const result = cuidSchema.safeParse(req.params.id);

    if (!result.success) {
        res.status(400).json({ error: "Некорректный ID" });
        return;
    }

    next();
};