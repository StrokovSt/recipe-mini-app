import { JSX } from "react";

export enum AppRoute {
    Home = "/",
    Recipe = "/recipe/:id",
    AddRecipe = "/add",
    EditRecipe = "/edit/:id",
    Sections = "/sections",
    Profile = "/profile",
    Settings = "/settings",
    About = "/about",
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