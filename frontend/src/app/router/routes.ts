import { JSX } from "react";

export enum AppRoute {
    Home = "/",
    Recipe = "/recipe/:id",
    AddRecipe = "/add",
}

export interface RouteConfig {
    path: AppRoute;
    element: React.LazyExoticComponent<() => JSX.Element>;
    protected?: boolean; 
}