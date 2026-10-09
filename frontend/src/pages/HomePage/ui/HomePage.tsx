import { useState } from 'react';

import { useCategories } from "@/entities/category";
import { useRecipes } from '@/entities/recipe';
import type { GetRecipesProps } from '@/entities/recipe/types';
import { useTags } from '@/entities/tag';
import { PageHeader } from '@/shared/ui/PageHeader';
import { PageWrapper } from '@/shared/ui/PageWrapper';
import { RecipeFilters } from '@/widgets/RecipeFilters';
import { RecipeList } from '@/widgets/RecipeList';

import { HomeHeading } from './HomeHeading/HomeHeading';

const HomePage = () => {
    const [filters, setFilters] = useState<GetRecipesProps>({});
    const { data: recipes = [], isLoading } = useRecipes(filters);
    const { data: categories = [] } = useCategories();
    const { data: tags = [] } = useTags();

    return (
        <PageWrapper
            header={
                <PageHeader>
                    <HomeHeading />
                    <RecipeFilters
                        categories={categories}
                        tags={tags}
                        setFilters={setFilters}
                        filters={filters}
                    />
                </PageHeader>
            }
        >
            <RecipeList recipes={recipes} isLoading={isLoading} />

        </PageWrapper>
    );
};

export default HomePage;