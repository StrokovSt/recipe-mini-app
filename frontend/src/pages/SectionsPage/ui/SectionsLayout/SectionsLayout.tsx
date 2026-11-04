import { m } from "motion/react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

import catThinking from "@/shared/assets/images/messages/cat-thinking.webp";
import seal from "@/shared/assets/images/seal.webp";
import { TAB_HIDDEN, TAB_VISIBLE, TRANSITION_PAGE } from "@/shared/config/animation";
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
            {/* При смене вкладки проявляется только сетка, остальное стоит на месте */}
            <m.div className={styles.list} initial={TAB_HIDDEN} animate={TAB_VISIBLE} transition={TRANSITION_PAGE}>
                {children}
            </m.div>
            <p className={styles.quote}>
                <img className={styles.seal} src={seal} alt="" />
                {t("quote")}
            </p>

            <aside className={styles.aside}>
                {/* Содержимое по центру видимой части блока: при длинной сетке едет вместе с прокруткой */}
                <div className={styles.asideContent}>
                    <img className={styles.picture} src={catThinking} alt="" />
                    <div className={styles.copy}>
                        <h2 className={styles.title}>{createTitle}</h2>
                        <p className={styles.text}>{createText}</p>
                        <RegularButton type="button" className={styles.create} label={t("create.action")} onClick={onCreate} />
                    </div>
                </div>
            </aside>
        </div>
    );
};
