import type about from "./locales/ru/about.json";
import type common from "./locales/ru/common.json";
import type filters from "./locales/ru/filters.json";
import type footer from "./locales/ru/footer.json";
import type home from "./locales/ru/home.json";
import type menu from "./locales/ru/menu.json";
import type profile from "./locales/ru/profile.json";
import type recipe from "./locales/ru/recipe.json";
import type recipeForm from "./locales/ru/recipeForm.json";
import type sections from "./locales/ru/sections.json";
import type settings from "./locales/ru/settings.json";
import type units from "./locales/ru/units.json";

// Русские словари — эталон: по ним TypeScript проверяет ключи t() во всех языках.
// Новый словарь (страница, виджет) добавляется сюда же
export interface Resources {
    about: typeof about;
    common: typeof common;
    filters: typeof filters;
    footer: typeof footer;
    home: typeof home;
    menu: typeof menu;
    profile: typeof profile;
    recipe: typeof recipe;
    recipeForm: typeof recipeForm;
    sections: typeof sections;
    settings: typeof settings;
    units: typeof units;
}
