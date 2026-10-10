import type { FC, SVGProps } from "react";

import AppleIcon from "@/shared/assets/icons/category/icon-apple.svg?react";
import BeefIcon from "@/shared/assets/icons/category/icon-beef.svg?react";
import BreadIcon from "@/shared/assets/icons/category/icon-bread.svg?react";
import BurgerIcon from "@/shared/assets/icons/category/icon-burger.svg?react";
import CakeIcon from "@/shared/assets/icons/category/icon-cake.svg?react";
import CakeSliceIcon from "@/shared/assets/icons/category/icon-cake-slice.svg?react";
import CanapeIcon from "@/shared/assets/icons/category/icon-canape.svg?react";
import CarrotIcon from "@/shared/assets/icons/category/icon-carrot.svg?react";
import CheeseIcon from "@/shared/assets/icons/category/icon-cheese.svg?react";
import ChiliIcon from "@/shared/assets/icons/category/icon-chili.svg?react";
import CoffeeIcon from "@/shared/assets/icons/category/icon-coffee.svg?react";
import CookieIcon from "@/shared/assets/icons/category/icon-cookie.svg?react";
import CookingPotIcon from "@/shared/assets/icons/category/icon-cooking-pot.svg?react";
import CupSodaIcon from "@/shared/assets/icons/category/icon-cup-soda.svg?react";
import DrumstickIcon from "@/shared/assets/icons/category/icon-drumstick.svg?react";
import EggIcon from "@/shared/assets/icons/category/icon-egg.svg?react";
import FishIcon from "@/shared/assets/icons/category/icon-fish.svg?react";
import GrillIcon from "@/shared/assets/icons/category/icon-grill.svg?react";
import HeartIcon from "@/shared/assets/icons/category/icon-heart.svg?react";
import IceCreamIcon from "@/shared/assets/icons/category/icon-ice-cream.svg?react";
import JarIcon from "@/shared/assets/icons/category/icon-jar.svg?react";
import MushroomIcon from "@/shared/assets/icons/category/icon-mushroom.svg?react";
import PanIcon from "@/shared/assets/icons/category/icon-pan.svg?react";
import PastaIcon from "@/shared/assets/icons/category/icon-pasta.svg?react";
import PizzaIcon from "@/shared/assets/icons/category/icon-pizza.svg?react";
import RamenIcon from "@/shared/assets/icons/category/icon-ramen.svg?react";
import RiceIcon from "@/shared/assets/icons/category/icon-rice.svg?react";
import SaladIcon from "@/shared/assets/icons/category/icon-salad.svg?react";
import SauceBoatIcon from "@/shared/assets/icons/category/icon-sauce-boat.svg?react";
import ShrimpIcon from "@/shared/assets/icons/category/icon-shrimp.svg?react";
import SoupIcon from "@/shared/assets/icons/category/icon-soup.svg?react";
import StarIcon from "@/shared/assets/icons/category/icon-star.svg?react";
import SushiIcon from "@/shared/assets/icons/category/icon-sushi.svg?react";
import TacoIcon from "@/shared/assets/icons/category/icon-taco.svg?react";
import UtensilsIcon from "@/shared/assets/icons/category/icon-utensils.svg?react";
import VeganIcon from "@/shared/assets/icons/category/icon-vegan.svg?react";
import WineIcon from "@/shared/assets/icons/category/icon-wine.svg?react";

type SvgIcon = FC<SVGProps<SVGSVGElement>>;

interface CategoryIconConfig {
    Icon: SvgIcon;
}

// Библиотека иконок для категорий. Ключ — iconName, который хранится в категории.
// Ключи базовых категорий совпадают с backend/src/config/defaults.ts (DEFAULT_CATEGORIES).
// Подписи иконок — в словаре sections (icons.<ключ>)
export const CATEGORY_ICONS = {
    // Базовые категории
    Soup: { Icon: SoupIcon },
    CakeSlice: { Icon: CakeSliceIcon },
    Cake: { Icon: CakeIcon },
    Salad: { Icon: SaladIcon },
    Utensils: { Icon: PastaIcon },
    Beef: { Icon: BeefIcon },
    Fish: { Icon: FishIcon },
    Egg: { Icon: EggIcon },
    Vegan: { Icon: VeganIcon },
    CupSoda: { Icon: CupSodaIcon },
    Drumstick: { Icon: DrumstickIcon },
    Shrimp: { Icon: ShrimpIcon },
    Canape: { Icon: CanapeIcon },
    Rice: { Icon: RiceIcon },
    SauceBoat: { Icon: SauceBoatIcon },
    Jar: { Icon: JarIcon },

    // Дополнительные иконки для своих категорий
    Pizza: { Icon: PizzaIcon },
    Burger: { Icon: BurgerIcon },
    Sushi: { Icon: SushiIcon },
    Taco: { Icon: TacoIcon },
    Ramen: { Icon: RamenIcon },
    Bread: { Icon: BreadIcon },
    Cheese: { Icon: CheeseIcon },
    Grill: { Icon: GrillIcon },
    Chili: { Icon: ChiliIcon },
    Mushroom: { Icon: MushroomIcon },
    Carrot: { Icon: CarrotIcon },
    Apple: { Icon: AppleIcon },
    IceCream: { Icon: IceCreamIcon },
    Cookie: { Icon: CookieIcon },
    Coffee: { Icon: CoffeeIcon },
    Wine: { Icon: WineIcon },
    CookingPot: { Icon: CookingPotIcon },
    Pan: { Icon: PanIcon },
    Star: { Icon: StarIcon },
    Heart: { Icon: HeartIcon },
    Cutlery: { Icon: UtensilsIcon },
} as const satisfies Record<string, CategoryIconConfig>;

export type CategoryIconName = keyof typeof CATEGORY_ICONS;

// Список для выбора иконки при создании своей категории
export const CATEGORY_ICON_LIST = (Object.keys(CATEGORY_ICONS) as CategoryIconName[]).map((name) => ({
    name,
    ...CATEGORY_ICONS[name],
}));

// Иконка для категорий без iconName или с неизвестной иконкой
export const DEFAULT_CATEGORY_ICON: SvgIcon = CATEGORY_ICONS.Cutlery.Icon;

const isCategoryIconName = (name: string): name is CategoryIconName => name in CATEGORY_ICONS;

export const getCategoryIcon = (iconName?: string | null): SvgIcon => {
    if (iconName && isCategoryIconName(iconName)) {
        return CATEGORY_ICONS[iconName].Icon;
    }

    return DEFAULT_CATEGORY_ICON;
};
