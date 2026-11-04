import { createElement, type FC, type ImgHTMLAttributes } from "react";

// Картинки категорий — отдельные файлы, а не код: в начальном JS их нет, браузер качает только показанные
// и хранит каждую в кэше. ?no-inline: даже маленькие файлы не встраиваются в JS
const ICON_URLS = import.meta.glob<string>("@/shared/assets/icons/category/*.svg", {
    eager: true,
    query: "?no-inline",
    import: "default",
});

const getIconUrl = (file: string) => ICON_URLS[`/src/shared/assets/icons/category/${file}.svg`];

type SvgIcon = FC<ImgHTMLAttributes<HTMLImageElement>>;

// Картинка категории как компонент: места, где она стоит, не меняются (<Icon className=… />)
const icon = (file: string): SvgIcon => {
    const src = getIconUrl(file);
    return (props) => createElement("img", { src, alt: "", draggable: false, decoding: "async", ...props });
};

interface CategoryIconConfig {
    Icon: SvgIcon;
}

// Библиотека картинок для категорий. Ключ — iconName, который хранится в категории.
// Ключи базовых категорий совпадают с backend/src/config/defaults.ts (DEFAULT_CATEGORIES).
// Подписи картинок — в словаре sections (icons.<ключ>), цвета плиток — в shared/styles/category-colors.scss
export const CATEGORY_ICONS = {
    Misc: { Icon: icon("misc") },
    Soups: { Icon: icon("soups") },
    Baking: { Icon: icon("baking") },
    Desserts: { Icon: icon("desserts") },
    Salads: { Icon: icon("salads") },
    Snacks: { Icon: icon("snacks") },
    Pasta: { Icon: icon("pasta") },
    Pizza: { Icon: icon("pizza") },
    Burger: { Icon: icon("burger") },
    Meat: { Icon: icon("meat") },
    Fish: { Icon: icon("fish") },
    Seafood: { Icon: icon("seafood") },
    Breakfast: { Icon: icon("breakfast") },
    Veg: { Icon: icon("veg") },
    Drinks: { Icon: icon("drinks") },
    Ramen: { Icon: icon("ramen") },
    Rice: { Icon: icon("rice") },
    Porridge: { Icon: icon("porridge") },
    Onigiri: { Icon: icon("onigiri") },
    Dumplings: { Icon: icon("dumplings") },
    Bento: { Icon: icon("bento") },
    Sushi: { Icon: icon("sushi") },
    Stew: { Icon: icon("stew") },
    Wok: { Icon: icon("wok") },
    Poultry: { Icon: icon("poultry") },
    Grill: { Icon: icon("grill") },
    Sauces: { Icon: icon("sauces") },
    Pickles: { Icon: icon("pickles") },
    Mochi: { Icon: icon("mochi") },
    Tea: { Icon: icon("tea") },
    Coffee: { Icon: icon("coffee") },
    Fruits: { Icon: icon("fruits") },
    Mushrooms: { Icon: icon("mushrooms") },
    Pies: { Icon: icon("pies") },
    Cheese: { Icon: icon("cheese") },
    Spices: { Icon: icon("spices") },
    Streetfood: { Icon: icon("streetfood") },
    Berries: { Icon: icon("berries") },
    Citrus: { Icon: icon("citrus") },
    Preserves: { Icon: icon("preserves") },
    Pumpkin: { Icon: icon("pumpkin") },
} as const satisfies Record<string, CategoryIconConfig>;

export type CategoryIconName = keyof typeof CATEGORY_ICONS;

// Ключи старых иконок, которые ещё хранятся в базе, → новые картинки. Сохранится уже новый ключ
const LEGACY_ICON_NAMES: Record<string, CategoryIconName> = {
    Soup: "Soups",
    CakeSlice: "Baking",
    Cake: "Desserts",
    Salad: "Salads",
    Utensils: "Pasta",
    Beef: "Meat",
    Egg: "Breakfast",
    Vegan: "Veg",
    CupSoda: "Drinks",
    Drumstick: "Poultry",
    Shrimp: "Seafood",
    Canape: "Snacks",
    SauceBoat: "Sauces",
    Jar: "Preserves",
    Taco: "Streetfood",
    Bread: "Pies",
    Chili: "Spices",
    Mushroom: "Mushrooms",
    Carrot: "Pumpkin",
    Apple: "Fruits",
    IceCream: "Desserts",
    Cookie: "Baking",
    Wine: "Drinks",
    CookingPot: "Stew",
    Pan: "Wok",
    Star: "Misc",
    Heart: "Misc",
    Cutlery: "Misc",
};

// Список для выбора картинки при создании своей категории
export const CATEGORY_ICON_LIST = (Object.keys(CATEGORY_ICONS) as CategoryIconName[]).map((name) => ({
    name,
    ...CATEGORY_ICONS[name],
}));

// Картинка для категорий без iconName или с неизвестной иконкой
export const DEFAULT_CATEGORY_ICON_NAME: CategoryIconName = "Misc";
export const DEFAULT_CATEGORY_ICON: SvgIcon = CATEGORY_ICONS[DEFAULT_CATEGORY_ICON_NAME].Icon;

const isCategoryIconName = (name: string): name is CategoryIconName => name in CATEGORY_ICONS;

// Ключ картинки с учётом старых иконок
export const getCategoryIconName = (iconName?: string | null): CategoryIconName => {
    if (!iconName) return DEFAULT_CATEGORY_ICON_NAME;
    if (isCategoryIconName(iconName)) return iconName;

    return LEGACY_ICON_NAMES[iconName] ?? DEFAULT_CATEGORY_ICON_NAME;
};

export const getCategoryIcon = (iconName?: string | null): SvgIcon => CATEGORY_ICONS[getCategoryIconName(iconName)].Icon;
