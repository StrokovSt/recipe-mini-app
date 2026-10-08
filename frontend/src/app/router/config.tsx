import { lazy } from "react";

import { AppRoute, type RouteConfig } from "./routes";

const HomePage = lazy(() => import("@/pages/HomePage").then(m => ({ default: m.HomePage })));
const RecipePage = lazy(() => import("@/pages/RecipePage").then(m => ({ default: m.RecipePage })));
const AddRecipePage = lazy(() => import("@/pages/AddRecipePage").then(m => ({ default: m.AddRecipePage })));
const SectionsPage = lazy(() => import("@/pages/SectionsPage").then(m => ({ default: m.SectionsPage })));
const EditRecipePage = lazy(() => import("@/pages/EditRecipePage").then(m => ({ default: m.EditRecipePage })));
const ProfilePage = lazy(() => import("@/pages/ProfilePage").then(m => ({ default: m.ProfilePage })));
const SettingsPage = lazy(() => import("@/pages/SettingsPage").then(m => ({ default: m.SettingsPage })));
const AboutPage = lazy(() => import("@/pages/AboutPage").then(m => ({ default: m.AboutPage })));

export const routeConfig: RouteConfig[] = [
    {
        path: AppRoute.Home,
        element: HomePage,
    },
    {
        path: AppRoute.Recipe,
        element: RecipePage,
    },
    {
        path: AppRoute.AddRecipe,
        element: AddRecipePage,
    },
    {
        path: AppRoute.Sections,
        element: SectionsPage,
    },
    { 
        path: AppRoute.EditRecipe,
        element: EditRecipePage
    },
    {
        path: AppRoute.Profile,
        element: ProfilePage,
    },
    {
        path: AppRoute.Settings,
        element: SettingsPage,
    },
    {
        path: AppRoute.About,
        element: AboutPage,
    },
];