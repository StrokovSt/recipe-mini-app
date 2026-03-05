import { lazy } from "react";

import { AppRoute, type RouteConfig } from "./routes";

const HomePage = lazy(() => import("@/pages/HomePage").then(m => ({ default: m.HomePage })));
const RecipePage = lazy(() => import("@/pages/RecipePage").then(m => ({ default: m.RecipePage })));
const AddRecipePage = lazy(() => import("@/pages/AddRecipePage").then(m => ({ default: m.AddRecipePage })));

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
];