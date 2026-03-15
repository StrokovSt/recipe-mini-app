/// <reference path="./types/express.d.ts" />
import "dotenv/config"

import cors from "cors";
import express from "express";

import { authMiddleware } from "./middleware/auth";
import { errorHandler } from "./middleware/errorHandler";
import { generalLimiter, parseLimiter, uploadLimiter } from "./middleware/rateLimit";
import categoriesRouter from "./routes/categories";
import router from "./routes/parse";
import recipesRouter from "./routes/recipes";
import tagsRouter from "./routes/tags";
import uploadRouter from "./routes/upload";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.get("/health", (_req, res) => {
    res.json({ ok: true });
});

app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "x-user-id", "x-init-data"],
}));

app.use(authMiddleware);

app.use("/api/parse", parseLimiter, router);
app.use("/api/recipes", recipesRouter);
app.use("/api/categories", categoriesRouter);
app.use("/api/tags", tagsRouter);
app.use("/api/upload", uploadLimiter, uploadRouter);

app.use(generalLimiter);

app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});