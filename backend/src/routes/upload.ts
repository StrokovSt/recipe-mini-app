import { NextFunction, Request, Response, Router } from "express";

import cloudinary from "../api/cloudinary";

const router = Router();

router.post("/", async (req: Request, res: Response, next: NextFunction) => {
    const { base64, mimeType } = req.body;

    if (!base64 || !mimeType) {
        res.status(400).json({ error: "Укажи base64 и mimeType" });
        return;
    }

    try {
        const dataUri = `data:${mimeType};base64,${base64}`;
        const resourceType = mimeType.startsWith("video/") ? "video" : "image";

        const result = await cloudinary.uploader.upload(dataUri, {
            resource_type: resourceType,
            folder: "recipes",
        });

        res.json({
            url: result.secure_url,
            type: resourceType,
        });
    } 
    catch (error) {
        console.error("Cloudinary error:", error);
        const message = error instanceof Error ? error.message : "Ошибка загрузки";
        res.status(500).json({ error: message });
        next(error);
    }
});

export default router;