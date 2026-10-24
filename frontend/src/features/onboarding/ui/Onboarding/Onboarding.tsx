import clsx from "clsx";
import { AnimatePresence, motion } from "motion/react";
import { type KeyboardEvent, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";

import catIdea from "@/shared/assets/images/messages/cat-idea.webp";
import { TRANSITION_BASE, TRANSITION_PAGE } from "@/shared/config/animation";
import { useCloseOnBack } from "@/shared/lib/hooks";
import { OutlineButton, RegularButton } from "@/shared/ui/Buttons";

import { ONBOARDING_STEPS } from "../../config/steps";
import { getCardStyle, getHole, type Hole, isSameHole } from "../../lib/hole";
import { finishOnboarding, nextOnboardingStep, useOnboardingStep } from "../../model/onboardingStore";

import styles from "./Onboarding.module.scss";

const HIDDEN = { opacity: 0 };
const VISIBLE = { opacity: 1 };
const CARD_HIDDEN = { opacity: 0, transform: "translateY(8px)" };
const CARD_VISIBLE = { opacity: 1, transform: "translateY(0px)" };

// Обучение на главной: экран затемнён, подсвечена настоящая кнопка, рядом подсказка.
// Запускают его initOnboarding (первый вход) и пункт меню «Как пользоваться».
// Слой перекрывает страницу целиком, так что нажать что-то под ним нельзя.
// Закрывается «Пропустить», Esc и системной «Назад»
export function Onboarding() {
    const { t } = useTranslation("onboarding");
    const stepIndex = useOnboardingStep();
    const step = stepIndex === null ? undefined : ONBOARDING_STEPS[stepIndex];
    const [hole, setHole] = useState<Hole | null>(null);

    const close = useCloseOnBack(step !== undefined, finishOnboarding);

    // Подсветка следит за кнопкой каждый кадр: её место меняют переход страницы, загрузка картинок, поворот экрана
    useEffect(() => {
        if (!step) return;

        let frame = 0;
        const track = () => {
            const next = getHole(step.target);
            setHole((prev) => (next === null || isSameHole(prev, next) ? prev : next));
            frame = requestAnimationFrame(track);
        };
        track();
        return () => cancelAnimationFrame(frame);
    }, [step]);

    // Приветствие не считается: «1 из 6» начинается со следующего шага
    const stepNumber = stepIndex ?? 0;
    const total = ONBOARDING_STEPS.length - 1;
    const isLast = stepNumber === total;
    const handleNext = () => (isLast ? close() : nextOnboardingStep());

    // Фокус всегда на кнопке подсказки внутри слоя, поэтому Esc ловим на самом слое
    const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === "Escape") close();
    };

    return createPortal(
        <AnimatePresence onExitComplete={() => setHole(null)}>
            {step && hole && (
                <motion.div
                    key="onboarding"
                    className={styles.layer}
                    role="dialog"
                    aria-modal
                    aria-label={t("label")}
                    initial={HIDDEN}
                    animate={VISIBLE}
                    exit={HIDDEN}
                    transition={TRANSITION_BASE}
                    onKeyDown={handleKeyDown}
                >
                    <motion.div className={styles.hole} initial={hole} animate={hole} transition={TRANSITION_BASE} />

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={step.id}
                            className={clsx(styles.card, !step.target && styles.centered)}
                            style={step.target ? getCardStyle(hole) : undefined}
                            initial={CARD_HIDDEN}
                            animate={CARD_VISIBLE}
                            exit={CARD_HIDDEN}
                            transition={TRANSITION_PAGE}
                        >
                            {/* Как у шторки: заголовок и номер шага в полупрозрачной шапке */}
                            <header className={styles.header}>
                                <h2 className={styles.title}>{t(`${step.id}.title`)}</h2>
                                {step.target && (
                                    <span className={styles.counter}>{t("counter", { current: stepNumber, total })}</span>
                                )}
                            </header>

                            <div className={styles.body}>
                                {!step.target && <img className={styles.image} src={catIdea} alt="" />}
                                <p className={styles.text}>{t(`${step.id}.text`)}</p>

                                <div className={styles.actions}>
                                    {!isLast && <OutlineButton label={t("skip")} onClick={close} />}
                                    <RegularButton
                                        // Фокус на главной кнопке: Enter листает дальше
                                        autoFocus
                                        label={t(stepNumber === 0 ? "start" : isLast ? "done" : "next")}
                                        onClick={handleNext}
                                    />
                                </div>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </motion.div>
            )}
        </AnimatePresence>,
        document.body
    );
}
