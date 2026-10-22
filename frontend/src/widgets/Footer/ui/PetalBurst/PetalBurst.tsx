import { motion } from "motion/react";

import type { Burst } from "./createPetals";

import styles from "./PetalBurst.module.scss";

interface PetalBurstProps {
    burst: Burst | null;
    onDone: () => void;
}

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

// Лепесток сакуры с выемкой сверху
const PETAL_PATH = "M10 24C4 18 0 12 2 6 3.5 1.5 7 0 9 3L10 5 11 3C13 0 16.5 1.5 18 6 20 12 16 18 10 24Z";

// Лепестки разлетаются из «+» при нажатии
export function PetalBurst({ burst, onDone }: PetalBurstProps) {
    if (!burst) return null;

    return (
        <div key={burst.id} className={styles.burst} style={{ left: burst.x, top: burst.y }} aria-hidden>
            {burst.petals.map((petal, index) => (
                <motion.svg
                    key={index}
                    className={styles.petal}
                    viewBox="0 0 20 24"
                    initial={{ x: 0, y: 0, rotate: 0, scale: 0.3, opacity: 1 }}
                    animate={{
                        x: petal.x,
                        y: [0, petal.y, petal.y + 18],
                        rotate: petal.rotate,
                        scale: petal.scale,
                        opacity: [1, 1, 0],
                    }}
                    transition={{ duration: 0.9, delay: petal.delay, ease: EASE_OUT, times: [0, 0.6, 1] }}
                    onAnimationComplete={index === 0 ? onDone : undefined}
                >
                    <path d={PETAL_PATH} />
                </motion.svg>
            ))}
        </div>
    );
}
