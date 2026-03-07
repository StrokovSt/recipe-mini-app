import clsx from "clsx";
import { useState } from "react";

import styles from "./RecipeContent.module.scss";

interface RecipeContentProps {
    ingredients: string[];
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
                <div className={styles.list}>
                    {ingredients.length === 0 && (
                        <p className={styles.empty}>Ингредиенты не указаны</p>
                    )}
                    {ingredients.map((ing, i) => (
                        <div key={i} className={styles.ingredientItem}>
                            <span className={styles.dot} />
                            <span>{ing}</span>
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