import type { FC, SVGProps } from "react";

import BakingIcon from "@/shared/assets/icons/category/baking.svg?react";
import BentoIcon from "@/shared/assets/icons/category/bento.svg?react";
import BerriesIcon from "@/shared/assets/icons/category/berries.svg?react";
import BreakfastIcon from "@/shared/assets/icons/category/breakfast.svg?react";
import BurgerIcon from "@/shared/assets/icons/category/burger.svg?react";
import CheeseIcon from "@/shared/assets/icons/category/cheese.svg?react";
import CitrusIcon from "@/shared/assets/icons/category/citrus.svg?react";
import CoffeeIcon from "@/shared/assets/icons/category/coffee.svg?react";
import DessertsIcon from "@/shared/assets/icons/category/desserts.svg?react";
import DrinksIcon from "@/shared/assets/icons/category/drinks.svg?react";
import DumplingsIcon from "@/shared/assets/icons/category/dumplings.svg?react";
import FishIcon from "@/shared/assets/icons/category/fish.svg?react";
import FruitsIcon from "@/shared/assets/icons/category/fruits.svg?react";
import GrillIcon from "@/shared/assets/icons/category/grill.svg?react";
import MeatIcon from "@/shared/assets/icons/category/meat.svg?react";
import MiscIcon from "@/shared/assets/icons/category/misc.svg?react";
import MochiIcon from "@/shared/assets/icons/category/mochi.svg?react";
import MushroomsIcon from "@/shared/assets/icons/category/mushrooms.svg?react";
import OnigiriIcon from "@/shared/assets/icons/category/onigiri.svg?react";
import PastaIcon from "@/shared/assets/icons/category/pasta.svg?react";
import PicklesIcon from "@/shared/assets/icons/category/pickles.svg?react";
import PiesIcon from "@/shared/assets/icons/category/pies.svg?react";
import PizzaIcon from "@/shared/assets/icons/category/pizza.svg?react";
import PorridgeIcon from "@/shared/assets/icons/category/porridge.svg?react";
import PoultryIcon from "@/shared/assets/icons/category/poultry.svg?react";
import PreservesIcon from "@/shared/assets/icons/category/preserves.svg?react";
import PumpkinIcon from "@/shared/assets/icons/category/pumpkin.svg?react";
import RamenIcon from "@/shared/assets/icons/category/ramen.svg?react";
import RiceIcon from "@/shared/assets/icons/category/rice.svg?react";
import SaladsIcon from "@/shared/assets/icons/category/salads.svg?react";
import SaucesIcon from "@/shared/assets/icons/category/sauces.svg?react";
import SeafoodIcon from "@/shared/assets/icons/category/seafood.svg?react";
import SnacksIcon from "@/shared/assets/icons/category/snacks.svg?react";
import SoupsIcon from "@/shared/assets/icons/category/soups.svg?react";
import SpicesIcon from "@/shared/assets/icons/category/spices.svg?react";
import StewIcon from "@/shared/assets/icons/category/stew.svg?react";
import StreetfoodIcon from "@/shared/assets/icons/category/streetfood.svg?react";
import SushiIcon from "@/shared/assets/icons/category/sushi.svg?react";
import TeaIcon from "@/shared/assets/icons/category/tea.svg?react";
import VegIcon from "@/shared/assets/icons/category/veg.svg?react";
import WokIcon from "@/shared/assets/icons/category/wok.svg?react";

type SvgIcon = FC<SVGProps<SVGSVGElement>>;

interface CategoryIconConfig {
    Icon: SvgIcon;
}

// Библиотека картинок для категорий. Ключ — iconName, который хранится в категории.
// Ключи базовых категорий совпадают с backend/src/config/defaults.ts (DEFAULT_CATEGORIES).
// Подписи картинок — в словаре sections (icons.<ключ>), цвета плиток — в shared/styles/category-colors.scss
export const CATEGORY_ICONS = {
    Misc: { Icon: MiscIcon },
    Soups: { Icon: SoupsIcon },
    Baking: { Icon: BakingIcon },
    Desserts: { Icon: DessertsIcon },
    Salads: { Icon: SaladsIcon },
    Snacks: { Icon: SnacksIcon },
    Pasta: { Icon: PastaIcon },
    Pizza: { Icon: PizzaIcon },
    Burger: { Icon: BurgerIcon },
    Meat: { Icon: MeatIcon },
    Fish: { Icon: FishIcon },
    Seafood: { Icon: SeafoodIcon },
    Breakfast: { Icon: BreakfastIcon },
    Veg: { Icon: VegIcon },
    Drinks: { Icon: DrinksIcon },
    Ramen: { Icon: RamenIcon },
    Rice: { Icon: RiceIcon },
    Porridge: { Icon: PorridgeIcon },
    Onigiri: { Icon: OnigiriIcon },
    Dumplings: { Icon: DumplingsIcon },
    Bento: { Icon: BentoIcon },
    Sushi: { Icon: SushiIcon },
    Stew: { Icon: StewIcon },
    Wok: { Icon: WokIcon },
    Poultry: { Icon: PoultryIcon },
    Grill: { Icon: GrillIcon },
    Sauces: { Icon: SaucesIcon },
    Pickles: { Icon: PicklesIcon },
    Mochi: { Icon: MochiIcon },
    Tea: { Icon: TeaIcon },
    Coffee: { Icon: CoffeeIcon },
    Fruits: { Icon: FruitsIcon },
    Mushrooms: { Icon: MushroomsIcon },
    Pies: { Icon: PiesIcon },
    Cheese: { Icon: CheeseIcon },
    Spices: { Icon: SpicesIcon },
    Streetfood: { Icon: StreetfoodIcon },
    Berries: { Icon: BerriesIcon },
    Citrus: { Icon: CitrusIcon },
    Preserves: { Icon: PreservesIcon },
    Pumpkin: { Icon: PumpkinIcon },
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
