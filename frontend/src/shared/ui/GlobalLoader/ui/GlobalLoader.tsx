import { AnimatePresence } from "motion/react";
import { useSyncExternalStore } from "react";

import { Spinner } from "@/shared/ui/Spinner";

import { finishLeaving, getLoaderState, subscribeLoader } from "../model/loaderStore";

// Один котик на всё приложение. Страницы сообщают о загрузке через useLoader
export function GlobalLoader() {
    const { isVisible, label, loader } = useSyncExternalStore(subscribeLoader, getLoaderState);

    return (
        <AnimatePresence onExitComplete={finishLeaving}>
            {isVisible && <Spinner key="loader" size="xl" label={label} loader={loader} delay={0} />}
        </AnimatePresence>
    );
}
