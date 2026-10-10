import { type ComponentType, lazy } from "react";

import { AppRoute, type RouteConfig } from "./routes";

type PageModule = { default: ComponentType };

// lazy с фоновой подгрузкой. Если код страницы уже загружен, lazy получает его синхронно
// и React не показывает пустой Suspense (~300мс) при первом переходе на страницу
const lazyPage = (load: () => Promise<PageModule>) => {
    let loaded: PageModule | undefined;
    const preload = () => load().then((module) => (loaded = module));
    const syncModule = (module: PageModule) => ({ then: (resolve: (value: PageModule) => void) => resolve(module) });
    const Page = lazy(() => (loaded ? syncModule(loaded) : preload()) as Promise<PageModule>);

    return { Page, preload };
};

const PAGES = {
    HomePage: lazyPage(() => import("@/pages/HomePage").then(m => ({ default: m.HomePage }))),
    RecipePage: lazyPage(() => import("@/pages/RecipePage").then(m => ({ default: m.RecipePage }))),
    AddRecipePage: lazyPage(() => import("@/pages/AddRecipePage").then(m => ({ default: m.AddRecipePage }))),
    SectionsPage: lazyPage(() => import("@/pages/SectionsPage").then(m => ({ default: m.SectionsPage }))),
    EditRecipePage: lazyPage(() => import("@/pages/EditRecipePage").then(m => ({ default: m.EditRecipePage }))),
    ProfilePage: lazyPage(() => import("@/pages/ProfilePage").then(m => ({ default: m.ProfilePage }))),
    SettingsPage: lazyPage(() => import("@/pages/SettingsPage").then(m => ({ default: m.SettingsPage }))),
    AboutPage: lazyPage(() => import("@/pages/AboutPage").then(m => ({ default: m.AboutPage }))),
};

// Подгружаем код всех страниц в фоне после старта, чтобы переходы были без ожидания
export const preloadPages = () => Object.values(PAGES).forEach(({ preload }) => preload());

export const routeConfig: RouteConfig[] = [
    {
        path: AppRoute.Home,
        element: PAGES.HomePage.Page,
    },
    {
        path: AppRoute.Recipe,
        element: PAGES.RecipePage.Page,
    },
    {
        path: AppRoute.AddRecipe,
        element: PAGES.AddRecipePage.Page,
    },
    {
        path: AppRoute.Sections,
        element: PAGES.SectionsPage.Page,
    },
    { 
        path: AppRoute.EditRecipe,
        element: PAGES.EditRecipePage.Page,
    },
    {
        path: AppRoute.Profile,
        element: PAGES.ProfilePage.Page,
    },
    {
        path: AppRoute.Settings,
        element: PAGES.SettingsPage.Page,
    },
    {
        path: AppRoute.About,
        element: PAGES.AboutPage.Page,
    },
];