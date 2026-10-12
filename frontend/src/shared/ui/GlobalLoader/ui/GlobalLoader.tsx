import { AnimatePresence } from "motion/react";
import { useSyncExternalStore } from "react";

import { Spinner } from "@/shared/ui/Spinner";

import { getLoaderState, subscribeLoader } from "../model/loaderStore";

// Один котик на всё приложение. Страницы сообщают о загрузке через useLoader
export function GlobalLoader() {
    const { isVisible, label } = useSyncExternalStore(subscribeLoader, getLoaderState);

    return (
        <AnimatePresence>
            {isVisible && <Spinner key="loader" size="xl" label={label} delay={0} />}
        </AnimatePresence>
    );
}
