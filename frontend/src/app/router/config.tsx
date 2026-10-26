import { matchPath } from "react-router-dom";

import { lazyWithPreload } from "@/shared/lib/lazy";

import { AppRoute, type RouteConfig } from "./routes";

const PAGES = {
    HomePage: lazyWithPreload(() => import("@/pages/HomePage").then(m => ({ default: m.HomePage }))),
    RecipePage: lazyWithPreload(() => import("@/pages/RecipePage").then(m => ({ default: m.RecipePage }))),
    AddRecipePage: lazyWithPreload(() => import("@/pages/AddRecipePage").then(m => ({ default: m.AddRecipePage }))),
    ImportRecipePage: lazyWithPreload(() => import("@/pages/ImportRecipePage").then(m => ({ default: m.ImportRecipePage }))),
    CreateRecipePage: lazyWithPreload(() => import("@/pages/CreateRecipePage").then(m => ({ default: m.CreateRecipePage }))),
    DraftsPage: lazyWithPreload(() => import("@/pages/DraftsPage").then(m => ({ default: m.DraftsPage }))),
    SectionsPage: lazyWithPreload(() => import("@/pages/SectionsPage").then(m => ({ default: m.SectionsPage }))),
    EditRecipePage: lazyWithPreload(() => import("@/pages/EditRecipePage").then(m => ({ default: m.EditRecipePage }))),
    ProfilePage: lazyWithPreload(() => import("@/pages/ProfilePage").then(m => ({ default: m.ProfilePage }))),
    SettingsPage: lazyWithPreload(() => import("@/pages/SettingsPage").then(m => ({ default: m.SettingsPage }))),
    AboutPage: lazyWithPreload(() => import("@/pages/AboutPage").then(m => ({ default: m.AboutPage }))),
    NotFoundPage: lazyWithPreload(() => import("@/pages/NotFoundPage").then(m => ({ default: m.NotFoundPage }))),
};

let isPreloaded = false;

// Подгружаем код всех страниц в фоне один раз, чтобы переходы были без ожидания
export const preloadPages = () => {
    if (isPreloaded) return;
    isPreloaded = true;
    Object.values(PAGES).forEach(({ preload }) => preload());
};

export const routeConfig: RouteConfig[] = [
    {
        path: AppRoute.Home,
        page: PAGES.HomePage,
    },
    {
        path: AppRoute.Recipe,
        page: PAGES.RecipePage,
    },
    {
        path: AppRoute.AddRecipe,
        page: PAGES.AddRecipePage,
    },
    {
        path: AppRoute.ImportRecipe,
        page: PAGES.ImportRecipePage,
    },
    {
        path: AppRoute.CreateRecipe,
        page: PAGES.CreateRecipePage,
    },
    {
        path: AppRoute.Draft,
        page: PAGES.CreateRecipePage,
    },
    {
        path: AppRoute.Drafts,
        page: PAGES.DraftsPage,
    },
    {
        path: AppRoute.Sections,
        page: PAGES.SectionsPage,
    },
    { 
        path: AppRoute.EditRecipe,
        page: PAGES.EditRecipePage,
    },
    {
        path: AppRoute.Profile,
        page: PAGES.ProfilePage,
    },
    {
        path: AppRoute.Settings,
        page: PAGES.SettingsPage,
    },
    {
        path: AppRoute.About,
        page: PAGES.AboutPage,
    },
    {
        path: AppRoute.NotFound,
        page: PAGES.NotFoundPage,
    },
];

// Код страницы, которую открыли, качаем сразу при запуске, вместе со шрифтами и словарями, а не после первого рендера
export const preloadCurrentPage = () => {
    routeConfig.find(({ path }) => matchPath(path, location.pathname))?.page.preload();
};
