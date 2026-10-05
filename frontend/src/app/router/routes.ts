import { JSX } from "react";

export enum AppRoute {
    Home = "/",
    Recipe = "/recipe/:id",
    AddRecipe = "/add",
    EditRecipe = "/edit/:id",
    Tags = "/tags",
    Categories = "/categories",
    Settings = "/settings",
}

export const buildRoute = {
    recipe: (id: string) => `/recipe/${id}`,
    editRecipe: (id: string) => `/edit/${id}`,
};
export interface RouteConfig {
    path: AppRoute;
    element: React.LazyExoticComponent<() => JSX.Element | null>;
    protected?: boolean;
}