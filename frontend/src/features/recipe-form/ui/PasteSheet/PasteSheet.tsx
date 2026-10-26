import { useState } from "react";
import { useTranslation } from "react-i18next";

import { type Ingredient, UNIT_CODES } from "@recipe/common";

import { useFormatQuantity } from "@/entities/recipe";
import { BottomSheet } from "@/shared/ui/BottomSheet";
import { RegularButton } from "@/shared/ui/Buttons";
import { Textarea } from "@/shared/ui/Input";

import { parseIngredientList, type UnitLabels } from "../../model/parseIngredientList";

import styles from "./PasteSheet.module.scss";

interface PasteSheetProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (items: Ingredient[]) => void;
}

// «Вставить списком»: текст из заметок или с сайта, под ним сразу видно, что получится.
// Ошибку разбора можно поправить в самом тексте
const PasteSheet = ({ isOpen, onClose, onAdd }: PasteSheetProps) => {
    const { t } = useTranslation(["recipeForm", "units"]);
    const formatQuantity = useFormatQuantity();
    const [text, setText] = useState("");

    const labels = Object.fromEntries(UNIT_CODES.map((unit) => [unit, t(`units:label.${unit}`)])) as UnitLabels;
    const items = parseIngredientList(text, labels);

    const add = () => {
        onAdd(items);
        setText("");
        onClose();
    };

    return (
        <BottomSheet
            isOpen={isOpen}
            onClose={onClose}
            title={t("ingredients.paste")}
            subtitle={t("ingredients.pasteHint")}
            footer={
                <RegularButton
                    type="button"
                    label={t("ingredients.pasteSubmit", { count: items.length })}
                    className={styles.submit}
                    disabled={items.length === 0}
                    onClick={add}
                />
            }
        >
            <Textarea
                variant="line"
                label={t("ingredients.pasteLabel")}
                value={text}
                onChange={(event) => setText(event.target.value)}
            />

            {items.length > 0 && (
                <section className={styles.preview}>
                    <h3 className={styles.title}>{t("ingredients.pastePreview", { count: items.length })}</h3>
                    <ul className={styles.list}>
                        {items.map((item, index) => (
                            <li key={index} className={styles.item}>
                                <span className={styles.name}>{item.name}</span>
                                <span className={styles.quantity}>{formatQuantity(item)}</span>
                            </li>
                        ))}
                    </ul>
                </section>
            )}
        </BottomSheet>
    );
};

export default PasteSheet;
