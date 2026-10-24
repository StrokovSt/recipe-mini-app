import { LazyMotion } from "motion/react";
import { type ReactNode } from "react";

import { loadMotionFeatures } from "./loadMotionFeatures";

interface Props {
    children: ReactNode;
}

// m.div вместо motion.div: без движка анимаций, он приходит через loadMotionFeatures.
// strict — ошибка, если где-то остался motion.div: он затащил бы весь движок обратно в основной файл
export function MotionProvider({ children }: Props) {
    return (
        <LazyMotion features={loadMotionFeatures} strict>
            {children}
        </LazyMotion>
    );
}
