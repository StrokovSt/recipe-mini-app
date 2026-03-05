import { NavLink } from "react-router-dom";

import { AppRoute } from "@/app/router";

export function Navigation() {
    return (
        <nav>
            <NavLink to={AppRoute.Home}>Главная</NavLink>
            <NavLink to={AppRoute.AddRecipe}>Добавить</NavLink>
        </nav>
    );
}