import { useState } from "react";

// Хранит последнее непустое значение, чтобы контент не пропадал во время анимации скрытия
export const useLastValue = <T>(value: T) => {
    const [lastValue, setLastValue] = useState(value);

    if (value && value !== lastValue) {
        setLastValue(value);
    }

    return value || lastValue;
};
