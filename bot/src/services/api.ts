import type { MediaInput, ParsedRecipe, Recipe } from "@recipe/common";

const API_URL = process.env.API_URL ?? "http://localhost:3000";

export async function parseFromUrl(url: string, userId: string, existingMedia: MediaInput[] = []): Promise<ParsedRecipe> {
    const res = await fetch(`${API_URL}/api/parse`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "x-user-id": userId,
        },
        body: JSON.stringify({ url, existingMedia }), 
    });
    if (!res.ok) {
        const error = await res.json() as { message?: string; error?: string };
        throw new Error(error.message ?? error.error ?? "Ошибка парсинга");
    }

    return res.json() as Promise<ParsedRecipe>;
}

export async function parseFromImage(base64: string, mimeType: string, userId: string): Promise<ParsedRecipe> {
    const res = await fetch(`${API_URL}/api/parse/image`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "x-user-id": userId,
        },
        body: JSON.stringify({ base64, mimeType }),
    });

    if (!res.ok) {
        const error = await res.json() as { message?: string; error?: string };
        throw new Error(error.message ?? error.error ?? "Ошибка парсинга");
    }

    return res.json() as Promise<ParsedRecipe>;
}

export async function saveRecipe(recipe: ParsedRecipe, userId: string): Promise<Recipe> {
    const res = await fetch(`${API_URL}/api/recipes`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "x-user-id": userId,
        },
        body: JSON.stringify({
            ...recipe,
            media: recipe.media || [],
            tags: [],
        }),
    });

    if (!res.ok) {
        const error = await res.json() as { message?: string; error?: string };
        throw new Error(error.message ?? error.error ?? "Ошибка сохранения");
    }

    return res.json() as Promise<Recipe>;
}

export async function getUserRecipes(userId: string): Promise<Recipe[]> {
    const res = await fetch(`${API_URL}/api/recipes`, {
        headers: { "x-user-id": userId },
    });

    console.log("getUserRecipes status:", res.status, "API_URL:", API_URL);

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    return res.json() as Promise<Recipe[]>;
}

export async function parseFromText(text: string, userId: string): Promise<ParsedRecipe> {
    const res = await fetch(`${API_URL}/api/parse/text`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "x-user-id": userId,
        },
        body: JSON.stringify({ text }),
    });

    if (!res.ok) {
        const error = await res.json() as { message?: string; error?: string };
        throw new Error(error.message ?? error.error ?? "Ошибка парсинга");
    }

    return res.json() as Promise<ParsedRecipe>;
}

export async function uploadToTelegraph(buffer: ArrayBuffer, mimeType: string): Promise<string> {
    try {
        const formData = new FormData();
        
        const extension = mimeType.split("/")[1] || "jpg";
        const blob = new Blob([buffer], { type: mimeType });
        
        formData.append("file", blob, `media.${extension}`);

        const res = await fetch("https://telegra.ph/upload", {
            method: "POST",
            body: formData,
        });

        if (!res.ok) throw new Error(`Telegraph HTTP error: ${res.status}`);

        const data = await res.json();


        if (Array.isArray(data) && data[0]?.src) {
            return `https://telegra.ph${data[0].src}`;
        }

        const errorMsg = data && typeof data === 'object' ? JSON.stringify(data) : 'Unknown error';
        throw new Error(`Telegraph Error: ${errorMsg}`);

    } catch (error) {
        console.error("❌ Telegraph Upload Failed:", error);
        throw error; // Пробрасываем выше, чтобы не сохранять "undefined" в базу
    }
}