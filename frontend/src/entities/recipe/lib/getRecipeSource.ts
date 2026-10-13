import type { FunctionComponent, SVGProps } from "react";

import type { Recipe } from "@recipe/common";

import InstagramIcon from "@/shared/assets/icons/source/icon-instagram.svg?react";
import LinkIcon from "@/shared/assets/icons/source/icon-link.svg?react";
import PinterestIcon from "@/shared/assets/icons/source/icon-pinterest.svg?react";
import TelegramIcon from "@/shared/assets/icons/source/icon-telegram.svg?react";
import TiktokIcon from "@/shared/assets/icons/source/icon-tiktok.svg?react";
import VkIcon from "@/shared/assets/icons/source/icon-vk.svg?react";
import YoutubeIcon from "@/shared/assets/icons/source/icon-youtube.svg?react";

type SvgIcon = FunctionComponent<SVGProps<SVGSVGElement>>;

export interface RecipeSourceInfo {
    label: string;
    Icon: SvgIcon;
    // Ссылка на оригинал, null — ссылки нет (например, рецепт прислан в бота)
    url: string | null;
}

// Известные площадки: узнаём по домену ссылки, без ссылки — по полю source рецепта.
// Названия брендов не переводятся
const PLATFORMS: { label: string; Icon: SvgIcon; host: RegExp; source?: Recipe["source"] }[] = [
    { label: "Pinterest", Icon: PinterestIcon, host: /(^|\.)pinterest\.|^pin\.it$/, source: "pinterest" },
    { label: "Telegram", Icon: TelegramIcon, host: /^t\.me$|^telegram\.(org|me)$/, source: "telegram" },
    { label: "YouTube", Icon: YoutubeIcon, host: /(^|\.)youtube\.com$|^youtu\.be$/ },
    { label: "Instagram", Icon: InstagramIcon, host: /(^|\.)instagram\.com$/ },
    { label: "TikTok", Icon: TiktokIcon, host: /(^|\.)tiktok\.com$/ },
    { label: "VK", Icon: VkIcon, host: /(^|\.)vk\.(com|ru)$|(^|\.)vkvideo\.ru$/ },
];

const getHost = (url: string) => {
    try {
        return new URL(url).hostname.replace(/^www\./, "");
    } catch {
        return null;
    }
};

// Откуда рецепт, для плашки на обложке: площадка или домен сайта.
// null — ни ссылки, ни известной площадки
export const getRecipeSource = (recipe: Pick<Recipe, "source" | "sourceUrl">): RecipeSourceInfo | null => {
    const host = recipe.sourceUrl ? getHost(recipe.sourceUrl) : null;
    const url = host ? recipe.sourceUrl : null;
    const platform = PLATFORMS.find((item) => (host ? item.host.test(host) : item.source === recipe.source));

    if (platform) return { label: platform.label, Icon: platform.Icon, url };
    if (host) return { label: host, Icon: LinkIcon, url };
    return null;
};
