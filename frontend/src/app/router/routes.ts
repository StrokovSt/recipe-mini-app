import { JSX } from "react";

export enum AppRoute {
    Home = "/",
    Recipe = "/recipe/:id",
    AddRecipe = "/add",
    Tags = "/tags",
    Categories = "/categories",
    Settings ="/settings"
}

export interface RouteConfig {
    path: AppRoute;
    element: React.LazyExoticComponent<() => JSX.Element>;
    protected?: boolean; 
}