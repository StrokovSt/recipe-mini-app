/// <reference path="./types/express.d.ts" />
import "dotenv/config"

import { toNodeHandler } from "better-auth/node";
import cors from "cors";
import express from "express";

import { auth } from "./lib/auth";
import { authMiddleware } from "./middleware/auth";
import { errorHandler } from "./middleware/errorHandler";
import { generalLimiter, parseLimiter, uploadLimiter } from "./middleware/rateLimit";
import { requireAi } from "./middleware/requireAi";
import categoriesRouter from "./routes/categories";
import draftsRouter from "./routes/drafts";
import meRouter from "./routes/me";
import router from "./routes/parse";
import recipesRouter from "./routes/recipes";
import tagsRouter from "./routes/tags";
import uploadRouter from "./routes/upload";

const app = express();
const PORT = process.env.PORT || 3000;

app.set('trust proxy', 1);

const corsOptions = {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "x-init-data"],
    credentials: true,
};

app.use(cors(corsOptions));

app.get("/health", (_req, res) => {
    res.json({ ok: true });
});

app.use(generalLimiter);

// Вход, выход, Google. Better Auth сам читает тело запроса, поэтому до express.json
app.all("/api/auth/*splat", toNodeHandler(auth));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(authMiddleware);

app.use("/api/parse", parseLimiter, requireAi, router);
app.use("/api/me", meRouter);
app.use("/api/recipes", recipesRouter);
app.use("/api/categories", categoriesRouter);
app.use("/api/drafts", draftsRouter);
app.use("/api/tags", tagsRouter);
app.use("/api/upload", uploadLimiter, uploadRouter);

app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});