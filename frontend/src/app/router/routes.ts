import type { ComponentType } from "react";

export const AppRoute = {
    Home: "/",
    Recipe: "/recipe/:id",
    AddRecipe: "/add",
    ImportRecipe: "/add/import",
    CreateRecipe: "/add/form",
    Draft: "/add/draft/:id",
    Drafts: "/add/drafts",
    EditRecipe: "/edit/:id",
    Sections: "/sections",
    Profile: "/profile",
    Settings: "/settings",
    About: "/about",
    // Любой неизвестный адрес
    NotFound: "*",
} as const;

export type AppRoute = (typeof AppRoute)[keyof typeof AppRoute];

export const buildRoute = {
    recipe: (id: string) => `/recipe/${id}`,
    editRecipe: (id: string) => `/edit/${id}`,
    draft: (id: string) => `/add/draft/${id}`,
    // Главная с включённым фильтром
    homeByCategory: (id: string) => `/?category=${id}`,
    homeByTag: (id: string) => `/?tag=${id}`,
};

export interface RouteConfig {
    path: AppRoute;
    // Страница из lazyWithPreload: компонент и загрузка его кода заранее
    page: { Component: ComponentType; preload: () => Promise<unknown> };
    protected?: boolean;
}