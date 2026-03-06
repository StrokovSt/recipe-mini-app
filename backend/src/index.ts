/// <reference path="./types/express.d.ts" />
import "dotenv/config"

import cors from "cors";
import express from "express";

import { authMiddleware } from "./middleware/auth";
import categoriesRouter from "./routes/categories";
import router from "./routes/parse";
import recipesRouter from "./routes/recipes";
import tagsRouter from "./routes/tags";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
    res.json({ ok: true });
});

app.use(authMiddleware);

app.use("/api/parse", router);
app.use("/api/recipes", recipesRouter);
app.use("/api/categories", categoriesRouter);
app.use("/api/tags", tagsRouter);

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});