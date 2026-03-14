import clsx from "clsx";
import { useState } from "react";

import type { IngredientGroup } from "@recipe/common";

import styles from "./RecipeContent.module.scss";

interface RecipeContentProps {
    ingredients: IngredientGroup[];
    steps: string[];
}

type Tab = "ingredients" | "steps";

const TABS: { id: Tab; label: string }[] = [
    { id: "ingredients", label: "Ингредиенты" },
    { id: "steps", label: "Приготовление" },
];

export function RecipeContent(props: RecipeContentProps) {
    const { ingredients, steps } = props;
    const [tab, setTab] = useState<Tab>("ingredients");

    const totalIngredients = ingredients.reduce((acc, g) => acc + g.items.length, 0);

    return (
        <div className={styles.wrap}>
            <div className={styles.tabs}>
                {TABS.map((t) => (
                    <button
                        key={t.id}
                        onClick={() => setTab(t.id)}
                        className={clsx(styles.tab, tab === t.id && styles.tabActive)}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            {tab === "ingredients" && (
                <div className={styles.groups}>
                    {totalIngredients === 0 && (
                        <p className={styles.empty}>Ингредиенты не указаны</p>
                    )}
                    {ingredients.map((group, gi) => (
                        <div key={gi} className={styles.group}>
                            {group.title && (
                                <p className={styles.groupTitle}>{group.title}</p>
                            )}
                            <div className={styles.list}>
                                {group.items.map((ing, i) => (
                                    <div key={i} className={styles.ingredientItem}>
                                        <span className={styles.dot} />
                                        <span>{ing}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {tab === "steps" && (
                <div className={styles.list}>
                    {steps.length === 0 && (
                        <p className={styles.empty}>Шаги не указаны</p>
                    )}
                    {steps.map((step, i) => (
                        <div key={i} className={styles.stepItem}>
                            <span className={styles.stepNum}>{i + 1}</span>
                            <span>{step}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}