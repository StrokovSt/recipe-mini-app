import { lazyWithPreload } from "@/shared/lib/lazy";

import { AppRoute, type RouteConfig } from "./routes";

const PAGES = {
    HomePage: lazyWithPreload(() => import("@/pages/HomePage").then(m => ({ default: m.HomePage }))),
    RecipePage: lazyWithPreload(() => import("@/pages/RecipePage").then(m => ({ default: m.RecipePage }))),
    AddRecipePage: lazyWithPreload(() => import("@/pages/AddRecipePage").then(m => ({ default: m.AddRecipePage }))),
    ImportRecipePage: lazyWithPreload(() => import("@/pages/ImportRecipePage").then(m => ({ default: m.ImportRecipePage }))),
    CreateRecipePage: lazyWithPreload(() => import("@/pages/CreateRecipePage").then(m => ({ default: m.CreateRecipePage }))),
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
        element: PAGES.HomePage.Component,
    },
    {
        path: AppRoute.Recipe,
        element: PAGES.RecipePage.Component,
    },
    {
        path: AppRoute.AddRecipe,
        element: PAGES.AddRecipePage.Component,
    },
    {
        path: AppRoute.ImportRecipe,
        element: PAGES.ImportRecipePage.Component,
    },
    {
        path: AppRoute.CreateRecipe,
        element: PAGES.CreateRecipePage.Component,
    },
    {
        path: AppRoute.Draft,
        element: PAGES.CreateRecipePage.Component,
    },
    {
        path: AppRoute.Sections,
        element: PAGES.SectionsPage.Component,
    },
    { 
        path: AppRoute.EditRecipe,
        element: PAGES.EditRecipePage.Component,
    },
    {
        path: AppRoute.Profile,
        element: PAGES.ProfilePage.Component,
    },
    {
        path: AppRoute.Settings,
        element: PAGES.SettingsPage.Component,
    },
    {
        path: AppRoute.About,
        element: PAGES.AboutPage.Component,
    },
    {
        path: AppRoute.NotFound,
        element: PAGES.NotFoundPage.Component,
    },
];