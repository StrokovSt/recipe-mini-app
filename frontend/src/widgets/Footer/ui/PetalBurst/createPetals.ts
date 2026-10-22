// Лепестки для одного нажатия: случайные значения считаем в обработчике клика, а не при отрисовке
export interface Petal {
    x: number;
    y: number;
    rotate: number;
    scale: number;
    delay: number;
}

export interface Burst {
    id: number;
    // Центр кнопки «+» относительно приложения (#root)
    x: number;
    y: number;
    petals: Petal[];
}

const PETAL_COUNT = 13;

// Каждый лепесток летит веером вверх под своим углом, на свою дистанцию и чуть опадает в конце
export const createPetals = (): Petal[] =>
    Array.from({ length: PETAL_COUNT }, (_, index) => {
        const spread = (index + 0.5) / PETAL_COUNT;
        const angle = (-160 + spread * 140 + (Math.random() - 0.5) * 16) * (Math.PI / 180);
        const distance = 60 + Math.random() * 60;

        return {
            x: Math.cos(angle) * distance,
            y: Math.sin(angle) * distance,
            rotate: (Math.random() - 0.5) * 360,
            scale: 0.6 + Math.random() * 0.5,
            delay: Math.random() * 0.06,
        };
    });
