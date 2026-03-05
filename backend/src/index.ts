import cors from "cors";
import express from "express";

import { authMiddleware } from "./middleware/auth";
import router from "./routes/parse";
import recipesRouter from "./routes/recipes";

import "dotenv/config";

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

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});