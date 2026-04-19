import { useNavigate } from 'react-router-dom';

import { useCategories } from "@/entities/category";
import { useRecipes } from '@/entities/recipe';
import { PageWrapper } from '@/shared/ui/PageWrapper';
import { Spinner } from '@/shared/ui/Spinner';
import { StatsWidget } from '@/widgets/stats';
import { UserGreeting } from '@/widgets/UserGreeting';

import styles from './HomePage.module.scss'

const HomePage = () => {
    const navigate = useNavigate();

    const { data: recipes = [], isLoading } = useRecipes({});
    const { data: categories = [] } = useCategories();

    const stats = {
        total: recipes.length,
        cats: categories.length,
        pinterest: recipes.filter((r) => r.source === "pinterest").length,
    };

    if (isLoading) return <Spinner size='xl' />;

    return (
        <PageWrapper>
            <UserGreeting />
            <StatsWidget total={stats.total} categories={stats.cats} pinterest={stats.pinterest} />

            <div className={styles.grid}>
                {!isLoading && recipes.length === 0 && (
                    <div className={styles.empty}>Рецептов пока нет</div>
                )}
                {recipes.map((recipe) => (
                <div key={recipe.id} className={styles.card} onClick={() => navigate(`/recipe/${recipe.id}`)}>
                    <div className={styles.cardMedia}>
                    {recipe.media[0] && (
                        <img src={recipe.media[0].url} alt={recipe.title} className={styles.cardImg} />
                    )}
                    </div>
                    <div className={styles.cardBody}>
                    <p className={styles.cardTitle}>{recipe.title}</p>
                    {recipe.time && <p className={styles.cardTime}>⏱ {recipe.time}</p>}
                    </div>
                </div>
                ))}
            </div>
        </PageWrapper>
    );
};

export default HomePage;