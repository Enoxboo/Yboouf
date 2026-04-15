import {useState} from 'react';
import RecipeCard from '../components/recipe/RecipeCard';
import PopularRecipesCarousel from '../components/recipe/PopularRecipesCarousel';
import SearchBar from '../components/common/SearchBar';
import {useRecipes, useRecipeFilters} from '../hooks/useRecipes';
import {selectClassName} from '../utils/classNames';

const Home = () => {
    const [search, setSearch] = useState('');
    const [country, setCountry] = useState('');
    const [type, setType] = useState('');
    const [diet, setDiet] = useState('');
    const [ingredient, setIngredient] = useState('');

    const {data, isLoading, error} = useRecipes({search, country, type, diet, ingredient});
    const {data: filters, isLoading: filtersLoading} = useRecipeFilters();
    const recipes = data?.recipes || [];

    if (filtersLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-xl">Chargement des filtres...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-xl text-red-600">Erreur lors du chargement des recettes</div>
            </div>
        );
    }

    const typeLabels = {
        STARTER: 'Entrée',
        MAIN: 'Plat principal',
        DESSERT: 'Dessert',
        SNACK: 'Snack',
        DRINK: 'Boisson'
    };

    const dietLabels = {
        VEGETARIAN: 'Végétarien',
        VEGAN: 'Vegan',
        GLUTEN_FREE: 'Sans gluten',
        DAIRY_FREE: 'Sans lactose',
        HALAL: 'Halal',
        KOSHER: 'Casher'
    };

    return (
        <div>
            <div className="bg-linear-to-r from-[#095d63] to-white dark:from-primary dark:to-secondary rounded-lg px-4 py-6 sm:px-8 sm:py-8 mb-6 sm:mb-8">
                <h1 className="hero-text text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 sm:mb-4">
                    Des saveurs du monde délicieuses,
                </h1>
                <p className="hero-text text-base sm:text-lg lg:text-xl">
                    et votre recette favorite à portée de main.
                </p>
            </div>

            {!search && recipes.length > 0 && (
                <PopularRecipesCarousel recipes={recipes.slice(0, 10)}/>
            )}

            <div className="card mb-6 sm:mb-8">
                <div className="flex flex-col gap-2 sm:gap-3">
                    <div>
                        <SearchBar value={search} onChange={setSearch} isLoading={isLoading}/>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3">
                        <select
                            value={country}
                            onChange={(e) => setCountry(e.target.value)}
                            className={selectClassName}
                            aria-label="Filtrer par pays"
                        >
                            <option value="">Pays</option>
                            {filters?.countries?.map((c) => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>

                        <select
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                            className={selectClassName}
                            aria-label="Filtrer par type"
                        >
                            <option value="">Types</option>
                            {filters?.types?.map((t) => (
                                <option key={t} value={t}>{typeLabels[t]}</option>
                            ))}
                        </select>

                        <select
                            value={ingredient}
                            onChange={(e) => setIngredient(e.target.value)}
                            className={selectClassName}
                            aria-label="Filtrer par ingrédient"
                        >
                            <option value="">Ingrédients</option>
                            {filters?.ingredients?.map((i) => (
                                <option key={i} value={i}>{i}</option>
                            ))}
                        </select>

                        <select
                            value={diet}
                            onChange={(e) => setDiet(e.target.value)}
                            className={selectClassName}
                            aria-label="Filtrer par régime"
                        >
                            <option value="">Régimes</option>
                            {filters?.diets?.map((d) => (
                                <option key={d} value={d}>{dietLabels[d]}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">
                {search ? `Résultats pour "${search}"` : 'Toutes les recettes'}
            </h2>

            {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="card animate-pulse">
                            <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4"></div>
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                        </div>
                    ))}
                </div>
            ) : recipes.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-black dark:text-gray-300 text-lg">Aucune recette trouvée</p>
                    {search && (
                        <button onClick={() => setSearch('')} className="mt-4 text-primary dark:text-primary hover:underline">
                            Réinitialiser la recherche
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                    {recipes.map((recipe) => (
                        <RecipeCard key={recipe.id} recipe={recipe}/>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Home;
