declare namespace Express {
    interface Request {
        userId: string;
    }
}

interface ParsedRecipeAI {
    title: string;
    ingredients: string[];
    steps: string[];
    time: string | null;
    servings: number | null;
    tags: string[];
    error?: string;
}

export type MediaType = "image" | "video";
