import type { ParsedRecipe } from "@recipe/common";

import { Spinner } from "@/shared/ui/Spinner";

import styles from "./RecipeEditForm.module.scss";

interface RecipeEditFormProps {
    parsed: ParsedRecipe;
    category: string;
    isSaving: boolean;
    onCategoryChange: (value: string) => void;
    onTitleChange: (value: string) => void;
    onIngredientChange: (index: number, value: string) => void;
    onIngredientAdd: () => void;
    onIngredientRemove: (index: number) => void;
    onStepChange: (index: number, value: string) => void;
    onStepAdd: () => void;
    onStepRemove: (index: number) => void;
    onBack: () => void;
    onSave: () => void;
}

export function RecipeEditForm(props: RecipeEditFormProps) {
    const {
        parsed, category, isSaving,
        onCategoryChange, onTitleChange,
        onIngredientChange, onIngredientAdd, onIngredientRemove,
        onStepChange, onStepAdd, onStepRemove,
        onBack, onSave,
    } = props;

    return (
        <div className={styles.wrap}>
            {parsed.media[0] && (
                <div className={styles.media}>
                    <img src={parsed.media[0].url} alt={parsed.title} className={styles.mediaImg} />
                    <div className={styles.mediaOverlay} />
                </div>
            )}

            <div className={styles.content}>
                <div className={styles.field}>
                    <label className={styles.label}>Название</label>
                    <input
                        className={styles.input}
                        value={parsed.title}
                        onChange={(e) => onTitleChange(e.target.value)}
                    />
                </div>

                <div className={styles.field}>
                    <label className={styles.label}>Категория</label>
                    <input
                        className={styles.input}
                        value={category}
                        onChange={(e) => onCategoryChange(e.target.value)}
                    />
                </div>

                <div className={styles.field}>
                    <label className={styles.label}>Ингредиенты</label>
                    <div className={styles.list}>
                        {parsed.ingredients.map((ing, i) => (
                            <div key={i} className={styles.listRow}>
                                <span className={styles.dot} />
                                <input
                                    className={styles.listInput}
                                    value={ing}
                                    onChange={(e) => onIngredientChange(i, e.target.value)}
                                />
                                <button className={styles.removeBtn} onClick={() => onIngredientRemove(i)}>✕</button>
                            </div>
                        ))}
                    </div>
                    <button className={styles.addBtn} onClick={onIngredientAdd}>+ Добавить ингредиент</button>
                </div>

                <div className={styles.field}>
                    <label className={styles.label}>Шаги приготовления</label>
                    <div className={styles.list}>
                        {parsed.steps.map((step, i) => (
                            <div key={i} className={styles.listRow}>
                                <span className={styles.stepNum}>{i + 1}</span>
                                <input
                                    className={styles.listInput}
                                    value={step}
                                    onChange={(e) => onStepChange(i, e.target.value)}
                                />
                                <button className={styles.removeBtn} onClick={() => onStepRemove(i)}>✕</button>
                            </div>
                        ))}
                    </div>
                    <button className={styles.addBtn} onClick={onStepAdd}>+ Добавить шаг</button>
                </div>

                <div className={styles.actions}>
                    <button className={styles.btnSecondary} onClick={onBack}>Назад</button>
                    <button className={styles.btnPrimary} onClick={onSave} disabled={isSaving}>
                        {isSaving ? <Spinner size="sm" /> : "Сохранить"}
                    </button>
                </div>
            </div>
        </div>
    );
}