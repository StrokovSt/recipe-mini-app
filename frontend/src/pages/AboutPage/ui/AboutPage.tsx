import { useNavigate } from "react-router-dom";

import { IconButton } from "@/shared/ui/Buttons";
import { PageHeader } from "@/shared/ui/PageHeader";
import { PageWrapper } from "@/shared/ui/PageWrapper";

import styles from "./AboutPage.module.scss";

const AboutPage = () => {
    const navigate = useNavigate();

    return (
        <PageWrapper
            header={
                <PageHeader className={styles.header}>
                    <IconButton
                        icon="back"
                        round
                        type="button"
                        aria-label="Назад"
                        onClick={() => navigate(-1)}
                    />
                    <div>
                        <h1 className={styles.title}>О приложении</h1>
                        <p className={styles.subtitle}>Рецепты, которые остаются с вами</p>
                    </div>
                </PageHeader>
            }
        >
            <p className={styles.placeholder}>Скоро здесь появится информация о приложении</p>
        </PageWrapper>
    );
};

export default AboutPage;
