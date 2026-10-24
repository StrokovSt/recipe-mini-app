export const enum Plan {
    FREE = "FREE",
    PRO = "PRO",
}

export const PLAN_LIMITS = {
    [Plan.FREE]: {
        recipes: 50,
        mediaPerRecipe: 3,
    },
    [Plan.PRO]: {
        recipes: Infinity,
        mediaPerRecipe: 20,
    },
} as const;