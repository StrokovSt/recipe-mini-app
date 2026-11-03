import clsx from "clsx";

import styles from "./BrushPaint.module.scss";

// Подложка гуашью под элементом: заливка формы, тёмный и светлый мазки, рваная кромка, мягкая тень по форме.
// Родитель: position: relative и isolation: isolate. Цвета задаёт он же: --paint, --paint-dark, --paint-light,
// --paint-edge; --paint-hover: 1 — наведение (краска насыщеннее, кромка темнеет). Набор кистей — по месту
// родителя среди соседей, шесть по кругу (BrushPaint.module.scss)
interface BrushPaintProps {
    // Проще: только заливка и кромка, без мазков внутри — для мелких плиток, где мазки перебивают содержимое
    simple?: boolean;
}

export const BrushPaint = ({ simple }: BrushPaintProps) => (
    <span className={clsx(styles.brush, simple && styles.simple)} aria-hidden>
        <span className={styles.shadow}>
            <span className={styles.fill} />
        </span>
        <span className={styles.edge} />
    </span>
);
