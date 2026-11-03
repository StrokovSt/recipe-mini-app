import type { Theme } from "@/shared/lib/theme";
import type { SegmentedOption } from "@/shared/ui/SegmentedControl";

import styles from "./ThemePicker.module.scss";

interface ThemePickerProps {
    options: SegmentedOption<Theme>[];
    value: Theme;
    onChange: (theme: Theme) => void;
    label: string;
}

// Компьютер: тема выбирается по превью — маленькая страница приложения в цветах этой темы
export const ThemePicker = (props: ThemePickerProps) => {
    const { options, value, onChange, label } = props;

    return (
        <div className={styles.picker} role="radiogroup" aria-label={label}>
            {options.map((option) => (
                <button
                    key={option.id}
                    type="button"
                    role="radio"
                    aria-checked={value === option.id}
                    className={styles.option}
                    onClick={() => onChange(option.id)}
                >
                    {/* data-theme пересчитывает цвета внутри превью под эту тему (app/styles/index.scss) */}
                    <span className={styles.preview} data-theme={option.id} aria-hidden>
                        <span className={styles.bar} />
                        <span className={styles.line} />
                        <span className={styles.cards}>
                            <span className={styles.card} />
                            <span className={styles.card} />
                            <span className={styles.card} />
                        </span>
                        <span className={styles.fab} />
                    </span>
                    <span className={styles.label}>
                        {option.icon}
                        {option.label}
                    </span>
                </button>
            ))}
        </div>
    );
};
