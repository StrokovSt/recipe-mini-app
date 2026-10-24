// Шаги обучения на главной. target — значение data-onboarding у подсвечиваемой кнопки,
// без него шаг по центру экрана с котиком. Текст шага — onboarding:<id>
export type OnboardingStep =
    | { id: "welcome"; target?: undefined }
    | { id: "home" | "add" | "search" | "filter" | "sections" | "menu"; target: string };

export const ONBOARDING_STEPS: OnboardingStep[] = [
    { id: "welcome" },
    { id: "home", target: "home" },
    { id: "add", target: "add" },
    { id: "search", target: "search" },
    { id: "filter", target: "filter" },
    { id: "sections", target: "sections" },
    { id: "menu", target: "menu" },
];
