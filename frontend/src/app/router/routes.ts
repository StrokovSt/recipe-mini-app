import type { ComponentType } from "react";

export const AppRoute = {
    Home: "/",
    Recipe: "/recipe/:id",
    AddRecipe: "/add",
    EditRecipe: "/edit/:id",
    Sections: "/sections",
    Profile: "/profile",
    Settings: "/settings",
    About: "/about",
} as const;

export type AppRoute = (typeof AppRoute)[keyof typeof AppRoute];

export const buildRoute = {
    recipe: (id: string) => `/recipe/${id}`,
    editRecipe: (id: string) => `/edit/${id}`,
    // Главная с включённым фильтром
    homeByCategory: (id: string) => `/?category=${id}`,
    homeByTag: (id: string) => `/?tag=${id}`,
};

export interface RouteConfig {
    path: AppRoute;
    element: ComponentType;
    protected?: boolean;
}