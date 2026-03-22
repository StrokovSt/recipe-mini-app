const TELEGRAPH_API = "https://api.telegra.ph";

interface TelegraphAccount {
    access_token: string;
    short_name: string;
    author_name: string;
}

interface TelegraphPage {
    path: string;
    url: string;
    title: string;
}

interface TelegraphNode {
    tag: string;
    attrs?: Record<string, string>;
    children?: (string | TelegraphNode)[];
}

type TelegraphContent = (string | TelegraphNode)[];

export async function createAccount(shortName: string): Promise<TelegraphAccount> {
    const res = await fetch(`${TELEGRAPH_API}/createAccount?short_name=${shortName}&author_name=${shortName}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" }
    });
    const data = await res.json() as { ok: boolean; result: TelegraphAccount };
    if (!data.ok) throw new Error("Ошибка создания Telegraph аккаунта");
    return data.result;
}

export async function createPage(accessToken: string, title: string, content: TelegraphContent): Promise<TelegraphPage> {
    const res = await fetch(`${TELEGRAPH_API}/createPage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            access_token: accessToken,
            title,
            content: JSON.stringify(content),
            return_content: false,
        }),
    });
    const data = await res.json() as { ok: boolean; result: TelegraphPage };
    if (!data.ok) throw new Error("Ошибка создания Telegraph страницы");
    return data.result;
}

export async function uploadToTelegraph(buffer: ArrayBuffer, mimeType: string): Promise<string> {
    const blob = new Blob([buffer], { type: mimeType });
    const formData = new FormData();
    formData.append("file", blob, "media");

    const res = await fetch("https://telegra.ph/upload", {
        method: "POST",
        body: formData,
    });

    const data = await res.json() as { src: string }[];
    return `https://telegra.ph${data[0].src}`;
}