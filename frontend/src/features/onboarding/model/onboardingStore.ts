import { useSyncExternalStore } from "react";

import { splashHidden } from "@/shared/lib/splash";

import { ONBOARDING_STEPS } from "../config/steps";

// Обучение пройдено или пропущено. Пока на устройстве, позже переедет в /api/me
const DONE_STORAGE_KEY = "onboardingDone";

// Номер текущего шага, null — обучение не идёт
let step: number | null = null;
const listeners = new Set<() => void>();

function setStep(next: number | null) {
    step = next;
    listeners.forEach((listener) => listener());
}

const subscribe = (listener: () => void) => {
    listeners.add(listener);
    return () => {
        listeners.delete(listener);
    };
};

export const useOnboardingStep = () => useSyncExternalStore(subscribe, () => step);

export const isOnboardingDone = () => localStorage.getItem(DONE_STORAGE_KEY) !== null;

// С начала: при первом входе и из меню («Как пользоваться»)
export const startOnboarding = () => setStep(0);

export const nextOnboardingStep = () => {
    if (step === null) return;
    if (step < ONBOARDING_STEPS.length - 1) setStep(step + 1);
    else finishOnboarding();
};

// Пройдено до конца или пропущено: больше само не запускается
export const finishOnboarding = () => {
    localStorage.setItem(DONE_STORAGE_KEY, "1");
    setStep(null);
};

// Первый вход: обучение начинается, как только уйдёт заставка. Показывает его главная (HomePage),
// так что если приложение открыли сразу на другой странице, обучение дождётся перехода на главную
export function initOnboarding() {
    if (!isOnboardingDone()) splashHidden.then(startOnboarding);
}
