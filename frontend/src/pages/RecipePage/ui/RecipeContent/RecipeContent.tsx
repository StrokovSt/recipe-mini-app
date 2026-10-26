import clsx from "clsx";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import type { IngredientGroup, RecipeStep } from "@recipe/common";

import { scaleAmount, useFormatQuantity } from "@/entities/recipe";
import { animateContentChange } from "@/shared/lib/animations";
import { getImageUrl } from "@/shared/lib/image";
import { Checkbox } from "@/shared/ui/Checkbox";
import { SegmentedControl, type SegmentedOption } from "@/shared/ui/SegmentedControl";
import { Stepper } from "@/shared/ui/Stepper";

import styles from "./RecipeContent.module.scss";

// Ширина миниатюры фото шага с запасом на плотные экраны
const STEP_PHOTO_WIDTH = 400;

interface RecipeContentProps {
    ingredients: IngredientGroup[];
    steps: RecipeStep[];
    // Порции, на которые написан рецепт
    servings: number;
    onPhotoClick: (images: string[], index: number) => void;
}

type Tab = "ingredients" | "steps";

// Переключает элемент в наборе отмеченных (вычеркнутых)
const toggle = <T,>(set: Set<T>, item: T) => {
    const next = new Set(set);
    if (next.has(item)) next.delete(item);
    else next.add(item);
    return next;
};

// Ингредиенты и шаги на вкладках. Тап вычёркивает ингредиент («положил») или шаг («сделал»).
// Отметки живут только пока открыта страница
export function RecipeContent(props: RecipeContentProps) {
    const { ingredients, steps, servings: baseServings, onPhotoClick } = props;
    const { t } = useTranslation("recipe");
    const formatQuantity = useFormatQuantity();
    const [tab, setTab] = useState<Tab>("ingredients");
    const contentRef = useRef<HTMLDivElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);
    const [checkedIngredients, setCheckedIngredients] = useState<Set<string>>(new Set());
    const [doneSteps, setDoneSteps] = useState<Set<number>>(new Set());
    // Выбранные порции не сохраняем: при новом входе снова как в рецепте
    const [servings, setServings] = useState(baseServings);
    const ratio = servings / baseServings;

    const totalIngredients = ingredients.reduce((acc, group) => acc + group.items.length, 0);

    // Рецепт «только видео»: ни ингредиентов, ни шагов
    if (totalIngredients === 0 && steps.length === 0) {
        return <p className={clsx(styles.content, styles.empty)}>{t("noContent")}</p>;
    }

    const tabs: SegmentedOption<Tab>[] = [
        { id: "ingredients", label: t("tabs.ingredients") },
        { id: "steps", label: t("tabs.steps") },
    ];

    // Вкладки разной высоты: карточка плавно меняет высоту, а не прыгает
    const switchTab = (next: Tab) => {
        if (!contentRef.current || !panelRef.current) return setTab(next);
        animateContentChange(contentRef.current, panelRef.current, () => setTab(next));
    };

    return (
        <div ref={contentRef} className={styles.content}>
            <SegmentedControl options={tabs} value={tab} onChange={switchTab} />

            <div ref={panelRef} className={styles.panel}>
                {tab === "ingredients" && totalIngredients > 0 && (
                    <div className={styles.servings}>
                        <span className={styles.servingsLabel}>{t("servings")}</span>
                        <Stepper value={servings} onChange={setServings} />
                    </div>
                )}

                {tab === "ingredients" && (totalIngredients === 0 ? (
                    <p className={styles.empty}>{t("noIngredients")}</p>
                ) : (
                    ingredients.map((group, groupIndex) => (
                        <div key={groupIndex} className={styles.group}>
                            {group.title && <h3 className={styles.groupTitle}>{group.title}</h3>}
                            <ul className={styles.list}>
                                {group.items.map((ingredient, index) => {
                                    const key = `${groupIndex}-${index}`;
                                    const isChecked = checkedIngredients.has(key);

                                    return (
                                        <li key={key}>
                                            <Checkbox
                                                className={styles.ingredient}
                                                label={ingredient.name}
                                                aside={formatQuantity(scaleAmount(ingredient, ratio))}
                                                checked={isChecked}
                                                onChange={() => setCheckedIngredients((prev) => toggle(prev, key))}
                                            />
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    ))
                ))}

                {tab === "steps" && (steps.length === 0 ? (
                    <p className={styles.empty}>{t("noSteps")}</p>
                ) : (
                    <ol className={styles.list}>
                        {steps.map((step, index) => {
                            const isDone = doneSteps.has(index);

                            return (
                                <li key={index} className={clsx(styles.step, isDone && styles.crossed)}>
                                    <button
                                        type="button"
                                        className={styles.stepText}
                                        aria-pressed={isDone}
                                        onClick={() => setDoneSteps((prev) => toggle(prev, index))}
                                    >
                                        <span className={styles.number}>{index + 1}</span>
                                        <span className={styles.name}>{step.text}</span>
                                    </button>

                                    {step.images.length > 0 && (
                                        <div className={styles.photos}>
                                            {step.images.map((url, photoIndex) => (
                                                <button
                                                    key={url}
                                                    type="button"
                                                    className={styles.photo}
                                                    aria-label={t("openPhoto")}
                                                    onClick={() => onPhotoClick(step.images, photoIndex)}
                                                >
                                                    <img src={getImageUrl(url, STEP_PHOTO_WIDTH)} alt="" loading="lazy" />
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </li>
                            );
                        })}
                    </ol>
                ))}
            </div>
        </div>
    );
}
