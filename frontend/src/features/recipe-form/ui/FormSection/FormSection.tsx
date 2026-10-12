import type { ReactNode } from "react";

import { SectionCard } from "@/shared/ui/SectionCard";

import styles from "./FormSection.module.scss";

interface FormSectionProps {
    title: string;
    // Подпись под заголовком, например «необязательно»
    description?: string;
    // Номер секции в печати, как в карточках настроек: «一», «二»…
    mark: string;
    action?: ReactNode;
    children: ReactNode;
}

// Секция формы рецепта: карточка, как в настройках, чтобы заголовки читались на фоне картинки
const FormSection = (props: FormSectionProps) => {
    const { title, description, mark, action, children } = props;

    return (
        <SectionCard title={title} description={description} mark={mark} action={action} className={styles.section}>
            {children}
        </SectionCard>
    );
};

export default FormSection;
