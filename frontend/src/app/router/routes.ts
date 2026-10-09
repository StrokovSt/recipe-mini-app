import type { JSX } from "react";

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
};

export interface RouteConfig {
    path: AppRoute;
    element: React.LazyExoticComponent<() => JSX.Element | null>;
    protected?: boolean;
}