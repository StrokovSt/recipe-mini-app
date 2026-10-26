import { AnimatePresence, m } from "motion/react";
import { useId, useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";

import ChevronIcon from "@/shared/assets/icons/icon-chevron.svg?react";
import { TRANSITION_BASE } from "@/shared/config/animation";
import { InputController, TextareaController } from "@/shared/ui/Input";

import { NUTRITION_FIELDS } from "../../model/constants";
import type { RecipeFormValues } from "../../model/schema";
import CategorySelect from "../CategorySelect/CategorySelect";
import FormSection from "../FormSection/FormSection";
import NutritionFields from "../NutritionFields/NutritionFields";
import ServingsField from "../ServingsField/ServingsField";
import TagsSelect from "../TagsSelect/TagsSelect";

import styles from "./MainFields.module.scss";

const COLLAPSED = { height: 0, opacity: 0 };
const EXPANDED = { height: "auto", opacity: 1 };

// Секция «Основное», как лист бумаги: поля «строкой» с подписями капсом. Название, описание,
// порции и время готовки, категория, теги, внизу сворачиваемое КБЖУ на порцию
const MainFields = () => {
    const { t } = useTranslation("recipeForm");
    const { control, getValues, formState: { errors } } = useFormContext<RecipeFormValues>();
    const nutritionId = useId();

    // КБЖУ вручную вводят редко: строка свёрнута, пока чисел нет (у импортированного рецепта они обычно есть).
    // Поле с ошибкой не прячем
    const [isNutritionOpen, setIsNutritionOpen] = useState(() =>
        NUTRITION_FIELDS.some((name) => getValues(name) != null)
    );
    const isNutritionShown = isNutritionOpen || NUTRITION_FIELDS.some((name) => errors[name]);

    return (
        <FormSection mark="二" title={t("sections.main")}>
            <InputController
                name="title"
                control={control}
                label={t("recipe.title")}
                variant="line"
                className={styles.title}
            />
            <TextareaController
                name="description"
                control={control}
                label={t("recipe.description")}
                variant="line"
                className={styles.description}
            />

            <div className={styles.numbers}>
                <Controller
                    control={control}
                    name="servings"
                    render={({ field }) => <ServingsField value={field.value ?? 1} onChange={field.onChange} />}
                />
                <InputController
                    name="cookTime"
                    control={control}
                    label={t("recipe.cookTime")}
                    type="number"
                    suffix={t("recipe.timeSuffix")}
                    variant="line"
                />
            </div>

            <h3 className={styles.label}>{t("recipe.category")}</h3>
            <Controller
                control={control}
                name="categoryId"
                render={({ field }) => (
                    <CategorySelect value={field.value ?? null} onChange={field.onChange} />
                )}
            />

            <h3 className={styles.label}>{t("tags")}</h3>
            <Controller
                control={control}
                name="tagIds"
                render={({ field }) => (
                    <TagsSelect value={field.value} onChange={field.onChange} />
                )}
            />

            <div className={styles.nutrition}>
                <button
                    type="button"
                    className={styles.toggle}
                    aria-expanded={isNutritionShown}
                    aria-controls={isNutritionShown ? nutritionId : undefined}
                    onClick={() => setIsNutritionOpen(!isNutritionShown)}
                >
                    {t("recipe.nutrition")}
                    <ChevronIcon aria-hidden />
                </button>

                <AnimatePresence initial={false}>
                    {isNutritionShown && (
                        <m.div
                            className={styles.collapse}
                            initial={COLLAPSED}
                            animate={EXPANDED}
                            exit={COLLAPSED}
                            transition={TRANSITION_BASE}
                        >
                            <NutritionFields id={nutritionId} />
                        </m.div>
                    )}
                </AnimatePresence>
            </div>
        </FormSection>
    );
};

export default MainFields;
