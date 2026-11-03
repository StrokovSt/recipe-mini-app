import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

import catIdea from "@/shared/assets/images/messages/cat-idea.webp";
import seal from "@/shared/assets/images/seal.webp";
import { useLayoutMode } from "@/shared/lib/layout";
import { RegularButton } from "@/shared/ui/Buttons";

import styles from "./SectionsLayout.module.scss";

interface SectionsLayoutProps {
    // Сетка категорий или тегов
    children: ReactNode;
    // Блок справа на компьютере: зовёт создать категорию или тег
    createTitle: string;
    createText: string;
    onCreate: () => void;
}

// Компьютер: сетка слева, справа блок «Создать» на всю высоту сетки, под сеткой атмосферная фраза на её ширину. Телефон и планшет: только сетка
export const SectionsLayout = (props: SectionsLayoutProps) => {
    const { children, createTitle, createText, onCreate } = props;
    const { t } = useTranslation("sections");
    const mode = useLayoutMode();
    const isDesktop = mode === "desktop" || mode === "wide";

    if (!isDesktop) return children;

    return (
        <div className={styles.layout}>
            <div className={styles.list}>{children}</div>
            <p className={styles.quote}>
                <img className={styles.seal} src={seal} alt="" />
                {t("quote")}
            </p>

            <aside className={styles.aside}>
                <img className={styles.picture} src={catIdea} alt="" />
                <h2 className={styles.title}>{createTitle}</h2>
                <p className={styles.text}>{createText}</p>
                <RegularButton type="button" className={styles.create} label={t("create.action")} onClick={onCreate} />
            </aside>
        </div>
    );
};
