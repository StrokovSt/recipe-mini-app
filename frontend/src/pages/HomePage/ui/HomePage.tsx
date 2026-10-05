import { useState } from 'react';

import { useCategories } from "@/entities/category";
import { useRecipes } from '@/entities/recipe';
import { GetRecipesProps } from '@/entities/recipe/types';
import { useTags } from '@/entities/tag';
import { PageWrapper } from '@/shared/ui/PageWrapper';
import { RecipeFilters } from '@/widgets/RecipeFilters';
import { RecipeList } from '@/widgets/RecipeList';
import { UserGreeting } from '@/widgets/UserGreeting';

const HomePage = () => {
    const [filters, setFilters] = useState<GetRecipesProps>({});
    const { data: recipes = [], isLoading } = useRecipes(filters);
    const { data: categories = [] } = useCategories();
    const { data: tags = [] } = useTags();

    return (
        <PageWrapper>
            <UserGreeting />
            <RecipeList recipes={recipes} isLoading={isLoading} />
            <RecipeFilters 
                categories={categories}
                tags={tags}
                setFilters={setFilters}
                filters={filters}
            />
        </PageWrapper>
    );
};

export default HomePage;