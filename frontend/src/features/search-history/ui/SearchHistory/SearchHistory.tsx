import { AnimatePresence, m } from "motion/react";
import { useTranslation } from "react-i18next";

import ClockIcon from "@/shared/assets/icons/icon-clock.svg?react";
import CloseIcon from "@/shared/assets/icons/icon-close.svg?react";
import { TRANSITION_BASE } from "@/shared/config/animation";

import { matchHistory } from "../../lib/matchHistory";
import { clearSearchHistory, removeFromSearchHistory, useSearchHistory } from "../../model/searchHistoryStore";

import styles from "./SearchHistory.module.scss";

const HIDDEN = { opacity: 0, transform: "translateY(-4px)" };
const VISIBLE = { opacity: 1, transform: "translateY(0px)" };

interface SearchHistoryProps {
    // Поле поиска в фокусе
    isOpen: boolean;
    // Что сейчас набрано в поле
    query: string;
    onPick: (query: string) => void;
}

// Выпадающий список недавних запросов под полем поиска, поверх страницы, как в поисковиках
export const SearchHistory = ({ isOpen, query, onPick }: SearchHistoryProps) => {
    const { t } = useTranslation("filters");
    const history = useSearchHistory();
    const items = matchHistory(history, query);
    // Истории ещё нет: при пустом поле подсказываем, что здесь появится
    const isEmptyHint = history.length === 0 && !query.trim();

    return (
        <AnimatePresence>
            {isOpen && (items.length > 0 || isEmptyHint) && (
                <m.div
                    className={styles.panel}
                    initial={HIDDEN}
                    animate={VISIBLE}
                    exit={HIDDEN}
                    transition={TRANSITION_BASE}
                    // Нажатие внутри не снимает фокус с поиска, иначе список закроется раньше, чем сработает клик
                    onMouseDown={(event) => event.preventDefault()}
                >
                    {isEmptyHint ? (
                        <p className={styles.empty}>{t("historyEmpty")}</p>
                    ) : (
                        <>
                            <div className={styles.header}>
                                <span className={styles.title}>{t("history")}</span>
                                <button type="button" className={styles.clear} onClick={clearSearchHistory}>
                                    {t("clearHistory")}
                                </button>
                            </div>

                            <ul className={styles.list}>
                                {items.map((item) => (
                                    <li key={item} className={styles.item}>
                                        <button type="button" className={styles.query} onClick={() => onPick(item)}>
                                            <ClockIcon aria-hidden />
                                            <span>{item}</span>
                                        </button>
                                        <button
                                            type="button"
                                            className={styles.remove}
                                            aria-label={t("removeQuery", { query: item })}
                                            onClick={() => removeFromSearchHistory(item)}
                                        >
                                            <CloseIcon aria-hidden />
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </>
                    )}
                </m.div>
            )}
        </AnimatePresence>
    );
};
