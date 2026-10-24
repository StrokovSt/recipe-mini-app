import clsx from "clsx";
import { m } from "motion/react";
import { type ReactNode, useEffect, useRef } from "react";

import { TRANSITION_PAGE } from "@/shared/config/animation";
import { finishHandedOffLoading, useIsLoaderShown } from "@/shared/ui/GlobalLoader";

import { markFirstPageShown } from "../model/firstPageShown";

import styles from "./PageWrapper.module.scss";

interface PageWrapperProps {
    children: ReactNode;
    header?: ReactNode;
    className?: string;
}

// transform строкой, а не y: так motion отдаёт анимацию браузеру (WAAPI) и она идёт мимо основного потока
const HIDDEN = { opacity: 0, transform: "translateY(8px)" };
const VISIBLE = { opacity: 1, transform: "translateY(0px)", transitionEnd: { transform: "none" } };

// Анимируется только контент: шапка при переходах стоит на месте, как footer.
// Пока котик на экране или гаснет, контент ждёт скрытым и всплывает после него
export function PageWrapper(props: PageWrapperProps) {
    const { children, header, className } = props;
    const isLoaderShown = useIsLoaderShown();
    const contentRef = useRef<HTMLDivElement>(null);

    // Страница отрисовалась: котик, переданный с прошлой страницы (например, после распознавания), уходит
    useEffect(() => {
        finishHandedOffLoading();
    }, []);

    // Котик ушёл и картинки контента загрузились: даём знать, что можно грузить второстепенное
    useEffect(() => {
        if (isLoaderShown || !contentRef.current) return;
        const images = [...contentRef.current.querySelectorAll("img")].filter((image) => image.loading !== "lazy");
        Promise.all(images.map((image) => image.decode().catch(() => undefined))).then(markFirstPageShown);
    }, [isLoaderShown]);

    return (
        <main className={clsx(styles.wrapper, className)}>
            {header}
            <m.div
                ref={contentRef}
                className={styles.content}
                initial={HIDDEN}
                animate={isLoaderShown ? HIDDEN : VISIBLE}
                exit={HIDDEN}
                transition={TRANSITION_PAGE}
            >
                {children}
            </m.div>
        </main>
    );
}
